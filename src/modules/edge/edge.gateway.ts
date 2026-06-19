import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  Inject,
  Logger,
  ValidationPipe,
  UsePipes,
  forwardRef,
} from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { EdgeService } from './services/edge.service';
import { OperationsService } from '../operations/services/operations.service';
import { DetectionEventDto } from './dtos/detection-event.dto';
import { RecordingEventDto } from './dtos/recording-event.dto';

@WebSocketGateway({
  namespace: '/edge',
  cors: {
    origin: '*',
  },
})
export class EdgeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EdgeGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => EdgeService))
    private edgeService: EdgeService,
    private operationsService: OperationsService,
  ) {}

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    const apiKey = client.handshake.headers['x-edge-api-key'];
    if (typeof apiKey === 'string') {
      return apiKey;
    }

    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string') {
      return authToken;
    }

    return undefined;
  }

  private async validateCameraAccess(
    client: Socket,
    cameraUuid: string,
    edgeId: number,
  ) {
    const siteSessionId = client.data.siteId as string | undefined;
    if (!siteSessionId) {
      return { ok: false as const, reason: 'Unauthorized site session', edgeId };
    }

    const ownsCamera = await this.edgeService.checkCameraOwnership(
      siteSessionId,
      cameraUuid,
    );
    if (!ownsCamera) {
      return {
        ok: false as const,
        reason: 'Unauthorized Camera for this Site',
        edgeId,
      };
    }

    const camera = await this.edgeService.getCameraForSite(
      siteSessionId,
      cameraUuid,
    );
    if (!camera) {
      return { ok: false as const, reason: 'Camera not found', edgeId };
    }

    return { ok: true as const, camera, edgeId };
  }

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    const site = await this.edgeService.findByApiKey(token ?? '');

    if (!site) {
      this.logger.warn('Rejected edge WebSocket connection: invalid token');
      client.disconnect(true);
      return;
    }

    client.data.siteId = site.uid;
    client.join(`site:${site.uid}`);
    await this.edgeService.markOnline(site.uid);
    this.logger.log(`Mini-PC connected: ${site.name} (${site.uid})`);
  }

  async handleDisconnect(client: Socket) {
    const siteId = client.data.siteId as string | undefined;
    if (siteId) {
      await this.edgeService.markOffline(siteId);
      this.logger.log(`Mini-PC disconnected: ${siteId}`);
    }
  }

  notifyConfigUpdated(siteUid: string) {
    this.server.to(`site:${siteUid}`).emit('config_updated', {
      reason: 'camera_config_changed',
      site_uid: siteUid,
    });
  }

  @SubscribeMessage('recording_event')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleRecordingEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RecordingEventDto,
  ) {
    const validation = await this.validateCameraAccess(
      client,
      payload.camera_uuid,
      payload.edge_id,
    );
    if (!validation.ok) {
      return {
        status: 'error',
        edge_id: validation.edgeId,
        reason: validation.reason,
      };
    }

    const expectedActivity = validation.camera.activity?.trim();
    if (
      expectedActivity &&
      payload.activity_type?.trim() !== expectedActivity
    ) {
      this.logger.warn(
        `Activity mismatch for camera ${payload.camera_uuid}: expected "${expectedActivity}", got "${payload.activity_type}"`,
      );
      return {
        status: 'error',
        edge_id: payload.edge_id,
        reason: 'Activity type mismatch for camera',
      };
    }

    try {
      const event = await this.operationsService.createRecordingEvent({
        site_uid: validation.camera.site_uid,
        camera_uid: validation.camera.uid,
        activity_type: payload.activity_type,
        event_start: payload.event_start,
        event_end: payload.event_end,
        duration_minutes: payload.duration_minutes,
        recording_url: payload.recording_url,
      });

      return {
        status: 'success',
        edge_id: payload.edge_id,
        cloud_event_id: event.event_id,
      };
    } catch (error) {
      return {
        status: 'error',
        edge_id: payload.edge_id,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @SubscribeMessage('detection_event')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async handleDetectionEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DetectionEventDto,
  ) {
    const validation = await this.validateCameraAccess(
      client,
      payload.camera_uuid,
      payload.edge_id,
    );
    if (!validation.ok) {
      return {
        status: 'error',
        edge_id: validation.edgeId,
        reason: validation.reason,
      };
    }

    if (!validation.camera.alert) {
      return {
        status: 'error',
        edge_id: payload.edge_id,
        reason: 'Violation detection not enabled for this camera',
      };
    }

    try {
      const alert = await this.operationsService.createAlert({
        camera_uid: validation.camera.uid,
        violation_name: payload.violation_name,
        severity: payload.severity,
        detected_at: payload.detected_at,
        image_url: payload.image_url,
        total_detections: 1,
        bbox: payload.bbox,
        recording_event_id: payload.recording_event_id,
      });

      return {
        status: 'success',
        edge_id: payload.edge_id,
        cloud_alert_id: alert.alert_id,
      };
    } catch (error) {
      return {
        status: 'error',
        edge_id: payload.edge_id,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
