const DERIVE_SUB_BRANDS = ['dahua', 'hikvision', 'uniview', 'tiandy'];

export function deriveSubRtsp(mainRtsp: string, brand?: string | null): string {
  const normalizedBrand = brand?.trim().toLowerCase() ?? '';

  if (!DERIVE_SUB_BRANDS.includes(normalizedBrand)) {
    return mainRtsp;
  }

  if (mainRtsp.includes('subtype=0')) {
    return mainRtsp.replace('subtype=0', 'subtype=1');
  }

  if (mainRtsp.includes('subtype=1')) {
    return mainRtsp;
  }

  if (mainRtsp.includes('realmonitor') || mainRtsp.includes('Streaming')) {
    const separator = mainRtsp.includes('?') ? '&' : '?';
    return `${mainRtsp}${separator}subtype=1`;
  }

  return mainRtsp;
}

export function buildEdgeStreamConfig(
  cameraUuid: string,
  masterRtsp: string,
  brand?: string | null,
) {
  const mainRtsp = masterRtsp;
  const subRtsp = deriveSubRtsp(mainRtsp, brand);

  return {
    camera_uuid: cameraUuid,
    main_rtsp: mainRtsp,
    sub_rtsp: subRtsp,
  };
}
