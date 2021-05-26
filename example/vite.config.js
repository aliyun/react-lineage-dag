import reactRefresh from '@vitejs/plugin-react-refresh';
import babel from '@rollup/plugin-babel';

/**
 * @type { import('vite').UserConfig }
 */
export default {
  plugins: [
    reactRefresh(),
  ],
  optimizeDeps: {
    include: [
      'react-dev-utils/webpackHotDevClient',
      '@ant-design/icons'
    ]
  }
};
