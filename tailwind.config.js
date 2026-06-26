/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      fontFamily: {
        // La guía especifica "AmcorPro" como primaria, pero mantenemos sans-serif
        // estándar web como fallback o si no tienes la fuente licenciada.
        sans: ['AmcorPro', 'Arial', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        brand: {
          // --- PRIMARY COLORS (Brand Foundations p.25) ---
          
          // [AMCOR DARK BLUE] - PMS 547
          // Uso: Dominante (37%+ del diseño), Textos principales, Botones primarios
          primary: {
            DEFAULT: '#00395A', 
            hover: '#002A42',   // 10% más oscuro para interacciones
            active: '#001A2B',  
            light: '#33607B',   // Tint 80% (aprox)
            soft: '#E5EBEE',    // Tint 10% (Fondo suave)
          },
          
          // [AMCOR LIGHT BLUE] - PMS 299
          // Uso: Dominante (junto al Dark Blue), Acciones, Iconos
          secondary: {
            DEFAULT: '#00A1DE',
            hover: '#0081B2',
            soft: '#E5F6FC',    // Tint 10% (Fondo suave)
          },

          // [AMCOR GREEN] - PMS 7482
          // Uso: Limitado, Sostenibilidad, Éxito
          green: {
            DEFAULT: '#00A551',
            hover: '#008441',
            soft: '#E5F6ED',    // Tint 10%
          },

          // --- NEUTRALS (Brand Foundations p.26) ---
          neutral: {
            white: '#FFFFFF',     // Debe ser 37% del diseño (Espacio en blanco)
            'warm-gray': '#A59D95', // PMS Warm Gray 6
            'cool-gray': '#9A9B9C', // PMS Cool Gray 7
            bg: '#F4F7FE',        // Fondo general app (manteniendo estructura previa)
          }
        },
        
        // --- SECONDARY / ACCENT COLORS (Brand Foundations p.26) ---
        // Uso: Máximo 12% del diseño. Gráficos y tablas.
        accent: {
          orange: '#E98300', // PMS 144 (Solo para Seguridad/Safety)
          yellow: '#FFC72C', // PMS 123
          purple: '#93328E', // PMS 513
          magenta: '#C90062',// PMS 214
          cyan: '#007BBD',   // PMS 7461
          mediumBlue: '#005DA3', // PMS 2384
        },

        // --- ESTADOS SEMÁNTICOS (Basado en usos de UI) ---
        state: {
          success: {
            DEFAULT: '#00A551', // Usa Amcor Green
            bg: '#E5F6ED',
          },
          warning: {
            DEFAULT: '#FFC72C', // Usa Amcor Yellow
            bg: '#FFF9EA',
          },
          error: {
            DEFAULT: '#C90062', // Usa Amcor Magenta/Pink como error (o Red estándar si prefieres)
            bg: '#FAE5EF',
          },
          info: {
            DEFAULT: '#00A1DE', // Usa Amcor Light Blue
            bg: '#E5F6FC',
          },
          safety: {
            DEFAULT: '#E98300', // Exclusivo para temas de seguridad
            bg: '#FDF0E5',
          }
        }
      },
      
      boxShadow: {
        // Ajustadas al Amcor Dark Blue (#00395A)
        'card': '0px 18px 40px 0px rgba(0, 57, 90, 0.08)', 
        'glow': '0px 10px 20px 0px rgba(0, 161, 222, 0.25)', // Glow con Light Blue
        'brand': '0px 14px 26px -12px rgba(0, 57, 90, 0.40)', 
      },
      
      backgroundImage: {
        // Degradados sugeridos por la identidad visual
        'brand-gradient': 'linear-gradient(to right, #00395A 0%, #00A1DE 100%)', // Dark to Light Blue
        'petrol-gradient': 'linear-gradient(135deg, #00395A 0%, #002A42 100%)', 
      },
    },
  },
  plugins: [],
}