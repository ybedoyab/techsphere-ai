# 🎨 Frontend - TechSphere AI

Esta carpeta contiene la interfaz de usuario del proyecto TechSphere AI.

## 📁 Estructura

```
frontend/
├── 📊 dashboard-v0/           # Dashboard interactivo generado con V0
│   ├── 📋 README.md           # Documentación del dashboard
│   ├── 📦 package.json        # Dependencias de Node.js
│   ├── ⚙️ next.config.js      # Configuración de Next.js
│   ├── 🎨 tailwind.config.js  # Configuración de Tailwind CSS
│   ├── 📝 tsconfig.json       # Configuración de TypeScript
│   └── 📁 src/                # Código fuente del dashboard
│       ├── 📱 app/            # Páginas de Next.js
│       ├── 🧩 components/     # Componentes React
│       ├── 📚 lib/            # Utilidades y helpers
│       ├── 📝 types/          # Tipos TypeScript
│       └── 🎨 styles/         # Estilos CSS
└── 📋 README.md               # Este archivo
```

## 🚀 Dashboard V0

El dashboard interactivo está ubicado en `dashboard-v0/` y proporciona:

- **📊 Gráficos interactivos**: Barras, donas y histogramas
- **🏥 Tema médico**: Colores y estilos profesionales
- **📱 Diseño responsive**: Funciona en todos los dispositivos
- **🌙 Dark/Light mode**: Soporte para ambos temas
- **⚡ Datos en tiempo real**: Conectado al análisis del backend

### 🎯 Cómo usar el Dashboard

1. **Navegar al directorio**:
   ```bash
   cd frontend/dashboard-v0
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

### 🔗 Integración con Backend

El dashboard se conecta automáticamente con los datos del backend a través de:

- **API Route**: `/api/v0-data` que lee `backend/results/v0_analysis_data.json`
- **Datos en tiempo real**: Se actualizan automáticamente
- **Fallback**: Si no hay datos, usa datos de ejemplo

## 🛠️ Tecnologías Utilizadas

- **React 18**: Framework moderno para la interfaz
- **Next.js 14**: Framework full-stack con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework CSS utilitario
- **Recharts**: Biblioteca de gráficos interactivos
- **Lucide React**: Iconos profesionales

## 📋 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Verificar código

# Instalación
npm install          # Instalar dependencias
npm ci               # Instalación limpia (CI/CD)
```

## 🎨 Personalización

### Colores y Temas

Los colores se definen en `src/styles/globals.css` con variables CSS personalizadas:

- **Tema médico**: Colores profesionales para biomedicina
- **Modo oscuro**: Soporte completo para dark mode
- **Paleta de gráficos**: 5 colores optimizados para visualizaciones

### Componentes

Los componentes están organizados en:

- **UI**: Componentes básicos reutilizables
- **Dashboard**: Componentes específicos del dashboard
- **Layout**: Estructura y navegación

## 🔧 Desarrollo

### Agregar Nuevos Gráficos

1. Crear componente en `src/components/`
2. Importar en `MedicalDashboard.tsx`
3. Agregar datos en `src/types/v0-data.ts`
4. Actualizar API en `src/app/api/v0-data/route.ts`

### Modificar Estilos

1. Editar `src/styles/globals.css` para variables CSS
2. Modificar `tailwind.config.js` para configuración de Tailwind
3. Usar clases de Tailwind en los componentes

## 📚 Recursos

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Lucide Icons](https://lucide.dev/)

---

**🏥 TechSphere AI** - Challenge de Clasificación Biomédica con IA
