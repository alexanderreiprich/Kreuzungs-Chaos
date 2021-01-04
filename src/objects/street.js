"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    class Street {
        constructor(_id, _startInt, _endInt, _startAway, _endAway) {
            this.id = _id;
            this.startInt = _startInt;
            this.endInt = _endInt;
            this.startAway = _startAway;
            this.endAway = _endAway;
        }
    }
    KreuzungsChaos.Street = Street;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=street.js.map