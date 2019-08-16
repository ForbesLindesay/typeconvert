"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Variance;
(function (Variance) {
    /**
     * Bivariant - this is the default
     *
     * Example:
     *
     *     interface Queue<Value> {
     *       push(value: Value): void;
     *       pop(): Value;
     *     }
     */
    Variance["ReadWrite"] = "ReadWrite";
    /**
     * Covariant
     *
     * Example:
     *
     *     interface QueueReader<+Value> {
     *       pop(): Value;
     *     }
     */
    Variance["ReadOnly"] = "ReadOnly";
    /**
     * Contravariant
     *
     * Example:
     *
     *     interface QueueWriter<-Value> {
     *       push(value: Value): void;
     *     }
     */
    Variance["WriteOnly"] = "WriteOnly";
})(Variance || (Variance = {}));
exports.default = Variance;
//# sourceMappingURL=Variance.js.map