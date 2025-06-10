// ColoredChip.jsx
import { Chip } from '@mui/material';

/**
 * @param {{
 *   label: string;
 *   color?: 'primary' | 'secondary';
 *   colorVariant?: 'main' | 'dark' | 'light';
 * }} props
 */
export default function ColoredChip({ label, color = 'primary', colorVariant = 'main' }) {
  return (
    <Chip
      label={label}
      color={color}
      // ownerState를 통해 내부에서만 사용되도록 하기 위해 spread
      // 단, colorVariant는 여기서 바로 넘기지 않음
      sx={(theme) => {
        const { palette } = theme;
        let backgroundColor = '';
        let textColor = '';

        if (color === 'primary') {
          backgroundColor = colorVariant === 'dark' ? palette.primary.dark : palette.primary.main;
          textColor = palette.primary.contrastText;
        } else if (color === 'secondary') {
          backgroundColor = colorVariant === 'light' ? palette.secondary.light : palette.secondary.main;
          textColor = palette.secondary.contrastText;
        }

        return {
          backgroundColor,
          color: textColor,
        };
      }}
    />
  );
}
