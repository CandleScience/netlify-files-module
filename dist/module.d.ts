import { Module } from '@nuxt/types';

declare type NetlifyToml = object;
interface ModuleOptions {
    copyExistingFiles?: boolean;
    detectForms?: boolean;
    existingFilesDirectory?: string;
    netlifyToml?: NetlifyToml | (() => NetlifyToml);
}
declare const CONFIG_KEY = "netlifyFiles";
declare const nuxtModule: Module<ModuleOptions>;
declare module '@nuxt/types' {
    interface NuxtConfig {
        [CONFIG_KEY]?: ModuleOptions;
    }
    interface Configuration {
        [CONFIG_KEY]?: ModuleOptions;
    }
}

export default nuxtModule;
export { ModuleOptions, NetlifyToml };
