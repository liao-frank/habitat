export const getPathFromParcelPath = (parcelPath: string): string => {
  return parcelPath.replace(/\?\d+$/, '').replace(/^file:\/\/\//, '')
}
