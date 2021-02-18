"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    async function communicate(_url) {
        let response = await fetch(_url);
        let settingsJSON = await response.json();
        KreuzungsChaos.gameSettings = settingsJSON;
    }
    KreuzungsChaos.communicate = communicate;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=gamesettings.js.map