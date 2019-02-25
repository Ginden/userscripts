declare enum gBool {
    true = "true",
    false = "false"
}
declare type Octo = {
    actor?: {
        login?: string;
    };
    dimensions?: {
        repository_is_fork: gBool;
        repository_nwo?: string;
        repository_parent_nwo?: string;
        repository_public?: gBool;
    };
};
declare var _octo: Octo;
declare const windowProxy: any;
declare const unsafeWindow: any;
