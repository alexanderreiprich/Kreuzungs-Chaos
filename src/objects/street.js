"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    class Street {
        constructor(_id, _startInt, _endInt, _startAway, _endAway, _stop) {
            this.id = _id;
            this.startInt = _startInt;
            this.endInt = _endInt;
            this.startAway = _startAway;
            this.endAway = _endAway;
            this.stop = _stop;
        }
    }
    KreuzungsChaos.Street = Street;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=street.js.map