declare type gBool = 'true' | 'false';

type Octo = {
    actor?: {
        id?: number;
        login?: string
    },
    dimensions?: {
        repository_is_fork: gBool;
        repository_nwo?: string;
        repository_parent_nwo?: string;
        repository_public?: gBool;
    }
};
declare var _octo : Octo;
declare const windowProxy: any;
declare const unsafeWindow: any;
