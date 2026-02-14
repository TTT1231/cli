//==================================== 项目依赖相关 ==================================
interface RequireDependencies {
   dependencies?: Record<string, string>;
   devDependencies?: Record<string, string>;
}

//项目依赖版本号
//==================================web-vue依赖=======================================
//web代码格式化
export const WEB_CODE_FORMAT: RequireDependencies = {
   devDependencies: {
      //eslint
      eslint: '^9.33.0',
      'eslint-config-prettier': '^10.1.8',
      'eslint-plugin-prettier': '^5.5.5',
      '@typescript-eslint/eslint-plugin': '^8.55.0',
      '@typescript-eslint/parser': '^8.55.0',

      //prettier
      prettier: '^3.6.2',
   },
};
//tailwindcss
export const WEB_TAILWINDCSS: RequireDependencies = {
   dependencies: {
      tailwindcss: '^4.1.17',
      '@tailwindcss/vite': '^4.1.18',
   },
};
export const WEB_DEVTOOLS_DEV_DEPENDENCY: Record<string, string> = {
   'vite-plugin-vue-devtools': '^8.0.6',
};

//web Router
export const WEB_ROUTER: RequireDependencies = {
   dependencies: {
      'vue-router': '^5.0.2',
      nprogress: '^0.2.0',
   },
};

//web-pinia
export const WEB_PINIA_DEPENDENCY: Record<string, string> = {
   pinia: '^3.0.3',
};
//web-request 请求相关依赖
export const WEB_REQUEST: RequireDependencies = {
   dependencies: {
      axios: '^1.10.0',
      qs: '^6.14.0',
      defu: '^6.1.4',
   },
   devDependencies: {
      '@types/qs': '^6.14.0',
   },
} as const;

//web组件库
export const WEB_Component_VUE: RequireDependencies = {
   dependencies: {
      'ant-design-vue': '^4.2.6',
   },
   devDependencies: {
      'unplugin-vue-components': '^30.0.0',
   },
};

export const WEB_SCSS_DEPENDENCY: Record<string, string> = {
   sass: '^1.94.0',
};
