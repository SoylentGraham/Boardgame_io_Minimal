var Type;
(function (Type) {
    Type[Type["SYNC"] = 0] = "SYNC";
    Type[Type["ASYNC"] = 1] = "ASYNC";
})(Type || (Type = {}));
class Async {
    /* istanbul ignore next */
    type() {
        /* istanbul ignore next */
        return Type.ASYNC;
    }
}
class Sync {
    type() {
        return Type.SYNC;
    }
    /**
     * Connect.
     */
    connect() {
        return;
    }
}

export { Async as A, Sync as S, Type as T };
