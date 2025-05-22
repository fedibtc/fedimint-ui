import React from 'react';
import { css, Global } from '@emotion/react';
import {
  AlertProps,
  cssVar,
  extendTheme,
  withDefaultColorScheme,
} from '@chakra-ui/react';

const INTER = 'Inter';
const STATUSES = ['info', 'warning', 'error', 'success'] as const;

export const palette = {
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    25: '#FCFCFD',
    50: '#F9FAFB',
    100: '#F2F4F7',
    200: '#EAECF0',
    300: '#D0D5DD',
    400: '#98A2B3',
    500: '#667085',
    600: '#475467',
    700: '#344054',
    800: '#1D2939',
    900: '#101828',
  },
  blue: {
    25: '#F5FAFF',
    50: '#EFF8FF',
    100: '#D1E9FF',
    200: '#B2DDFF',
    300: '#84CAFF',
    400: '#53B1FD',
    500: '#2E90FA',
    600: '#1570EF',
    700: '#175CD3',
    800: '#1849A9',
    900: '#194185',
  },
  red: {
    25: '#FFFBFA',
    50: '#FEF3F2',
    100: '#FEE4E2',
    200: '#FECDCA',
    300: '#FDA29B',
    400: '#F97066',
    500: '#F04438',
    600: '#D92D20',
    700: '#B42318',
    800: '#912018',
    900: '#7A271A',
  },
  yellow: {
    25: '#FFFCF5',
    50: '#FFFAEB',
    100: '#FEF0C7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#7A2E0E',
  },
  green: {
    25: '#F6FEF9',
    50: '#ECFDF3',
    100: '#D1FADF',
    200: '#A6F4C5',
    300: '#6CE9A6',
    400: '#32D583',
    500: '#12B76A',
    600: '#039855',
    700: '#027A48',
    800: '#05603A',
    900: '#054F31',
  },
};

const shadows = {
  // System
  xs: `0px 1px 2px ${hexToRgba(palette.gray[900], 0.05)}`,
  sm: `0px 1px 3px ${hexToRgba(
    palette.gray[900],
    0.1
  )}, 0px 1px 2px  ${hexToRgba(palette.gray[900], 0.06)}`,
  // Overrides
  outline: `0 0 0 2px ${palette.blue[200]}`,
};

export const colors = {
  ...palette,
  // Aliases
  info: palette.blue,
  error: palette.red,
  warning: palette.yellow,
  success: palette.green,
  text: {
    primary: palette.gray[900],
    secondary: palette.gray[600],
    label: palette.gray[700],
  },
  border: {
    input: palette.gray[300],
    button: palette.gray[300],
    table: palette.gray[200],
    hover: palette.gray[400],
    active: palette.blue[800],
  },
};

const textSizes = {
  xs: {
    fontSize: '12px',
    lineHeight: '18px',
  },
  sm: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  md: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  lg: {
    fontSize: '18px',
    lineHeight: '28px',
  },
  xl: {
    fontSize: '20px',
    lineHeight: '30px',
  },
};

const buttonSizes = {
  xs: {
    height: '36px',
    px: 4,
  },
  sm: {
    height: '40px',
    px: 5,
  },
  md: {
    height: '44px',
    px: 6,
  },
  lg: {
    height: '48px',
    px: 7,
  },
  xl: {
    height: '60px',
    px: 8,
  },
};

const inputSizes = Object.keys(buttonSizes).reduce((prev, key) => {
  const size = key as keyof typeof buttonSizes;
  const css = {
    height: buttonSizes[size].height,
    px: Math.floor(buttonSizes[size].px * 0.75),
    borderRadius: '8px',
  };
  prev = {
    ...prev,
    [size]: {
      field: css,
      addon: css,
    },
  };
  return prev;
}, {});

export const theme = extendTheme(
  {
    colors,
    shadows,
    fonts: {
      heading: `'${INTER}', sans-serif`,
      body: `'${INTER}', sans-serif`,
    },
    textStyles: textSizes,
    components: {
      Text: {
        baseStyle: {
          color: colors.text.primary,
        },
        variants: {
          secondary: {
            color: colors.text.secondary,
          },
        },
        sizes: textSizes,
      },
      Heading: {
        sizes: {
          xs: {
            fontSize: '24px',
            lineHeight: '32px',
          },
          sm: {
            fontSize: '30px',
            lineHeight: '38px',
          },
          md: {
            fontSize: '36px',
            lineHeight: '44px',
          },
          lg: {
            fontSize: '48px',
            lineHeight: '60px',
          },
          xl: {
            fontSize: '60px',
            lineHeight: '72px',
          },
          '2xl': {
            fontSize: '72px',
            lineHeight: '90px',
          },
        },
        variants: {
          xs: {
            fontSize: 100,
          },
        },
      },
      Button: {
        defaultProps: {
          size: 'md',
        },
        baseStyle: {
          _disabled: {
            pointerEvents: 'none',
          },
        },
        sizes: buttonSizes,
        variants: {
          solid: {
            bg: colors.blue[600],
            color: colors.white,
            _hover: {
              bg: colors.blue[700],
            },
            _active: {
              bg: colors.blue[600],
              boxShadow: `0 0 0 2px ${colors.blue[200]}`,
            },
            _disabled: {
              pointerEvents: 'none',
            },
          },
          outline: {
            bg: 'transparent',
            borderColor: colors.border.button,
            _hover: {
              bg: colors.blue[50],
              borderColor: colors.border.hover,
            },
          },
        },
      },
      FormLabel: {
        baseStyle: {
          color: colors.text.label,
          fontSize: '14px',
          lineHeight: '20px',
        },
      },
      FormHelperText: {
        baseStyle: {
          color: colors.text.secondary,
        },
      },
      Input: {
        defaultProps: {
          size: 'md',
        },
        baseStyle: {
          _disabled: {
            pointerEvents: 'none',
          },
        },
        sizes: inputSizes,
        field: {
          _disabled: {
            cursor: 'text',
          },
        },
        variants: {
          outline: {
            field: {
              borderColor: colors.border.input,
              boxShadow: shadows.xs,
              _hover: {
                borderColor: colors.border.hover,
              },
              _readOnly: {
                color: colors.gray[500],
              },
            },
          },
          filled: {
            field: {
              bg: colors.gray[50],
              color: colors.gray[600],
              _placeholder: {
                color: colors.gray[400],
              },
              _readOnly: {
                bg: colors.white,
              },
            },
          },
        },
      },
      Select: {
        defaultProps: {
          size: 'md',
        },
        variants: {
          outline: {
            field: {
              borderColor: colors.border.input,
              boxShadow: shadows.xs,
              _hover: {
                borderColor: colors.border.hover,
              },
            },
          },
        },
      },
      Table: {
        defaultProps: {
          colorScheme: 'gray',
        },
        baseStyle: {
          th: {
            color: colors.text.secondary,
            fontFamily: 'body',
            fontWeight: 'medium',
            textTransform: 'initial',
            letterSpacing: 'normal',
          },
          td: {
            textStyle: 'sm',
            fontWeight: 'medium',
          },
        },
        variants: {
          simple: {
            colorScheme: 'gray',
            padding: 4,
            borderWidth: 1,
            borderColor: colors.border.input,
            borderRadius: 12,
            borderCollapse: 'separate',
          },
        },
      },
      Card: {
        baseStyle: {
          container: {
            boxShadow: shadows.sm,
            borderBottom: `20px solid ${colors.gray[50]}`,
          },
        },
        sizes: {
          md: {
            header: {
              padding: '24px',
              paddingBottom: '8px',
            },
            body: {
              padding: '24px',
              paddingTop: '8px',
            },
          },
        },
      },
      Alert: {
        baseStyle: {
          container: {
            alignItems: 'flex-start',
            padding: '16px',
            borderRadius: '6px',
          },
        },
        variants: {
          subtle: (props: AlertProps) => {
            const { status } = props;
            const color =
              status && STATUSES.includes(status as (typeof STATUSES)[number])
                ? colors[status as (typeof STATUSES)[number]]
                : colors.gray;
            return {
              container: {
                [cssVar('alert-bg').variable]: color[50],
                [cssVar('alert-fg').variable]: color[400],
              },
              icon: {
                width: '20px',
                height: '20px',
              },
              title: {
                color: color[800],
                fontWeight: '600',
                marginBottom: '4px',
                ...textSizes.sm,
              },
              description: {
                color: color[700],
                ...textSizes.sm,
              },
            };
          },
        },
      },
    },
  },
  // By default all components use blue color scheme
  withDefaultColorScheme({ colorScheme: 'blue' }),
  // Override some components to use gray color scheme
  withDefaultColorScheme({ colorScheme: 'gray', components: ['Table'] })
);

export const Fonts = () => (
  <Global
    styles={[
      css`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;900&display=swap');
      `,
      {
        body: { fontFamily: 'Inter', background: '#F9F9F9' },
      },
    ]}
  />
);

/**
 * Given a hex value and an opacity from 0-1, convert to rgba notation.
 */
function hexToRgba(hexCode: string, opacity: number) {
  let hex = hexCode.replace('#', '');

  // Handle #RGB hex
  if (hex.length === 3) {
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r},${g},${b},${opacity})`;
}
