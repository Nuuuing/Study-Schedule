// 색상 밝기 계산하여 텍스트 색상 결정
export const getTextColor = (backgroundColor: string) => {
    if (!backgroundColor) return '#222';

    // 헥스 색상을 RGB로 변환
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // 밝기 계산 (0-255 범위)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // 밝기가 150 이상이면 어두운 텍스트, 미만이면 밝은 텍스트
    return brightness > 150 ? '#1f2937' : '#f9fafb';
};