const ScenarioPlaytest = (() => {

    const PLAYTEST_KEY =
        "MDC_PLAYTEST_SCENARIO_V1";


    const DRAFT_KEY =
        "MDC_SCENARIO_DRAFT_V1";


    let scenario;


    function readScenario() {

        const raw =
            sessionStorage.getItem(
                PLAYTEST_KEY
            )
            ||
            localStorage.getItem(
                DRAFT_KEY
            );


        if (!raw) {

            throw new Error(
                "Aucun scénario à tester.\n\n" +
                "Retourne dans le Scenario Editor et clique sur « Tester le scénario »."
            );

        }


        return JSON.parse(raw);

    }


    function renderScenarioInfo() {

        document
            .getElementById(
                "scenario-title"
            )
            .textContent =
            scenario.title ||
            "Scénario sans titre";


        document
            .getElementById(
                "scenario-story"
            )
            .textContent =
            scenario.story || "";


        document
            .getElementById(
                "scenario-campaign"
            )
            .textContent =
            scenario.campaign
                ? `${scenario.campaign} • Chapitre ${scenario.chapter || 1}`
                : `Chapitre ${scenario.chapter || 1}`;


        const meta =
            document.getElementById(
                "scenario-meta"
            );


        meta.innerHTML = "";


        const environment =
            ScenarioAdapter
                .ENVIRONMENTS[
                    scenario
                        .dungeon
                        .tiles
                        .environment
                ];


        const values = [

            `Taille : ${scenario.dungeon.size}`,

            `Environnement : ${
                environment?.label ||
                scenario.dungeon.tiles.environment
            }`,

            scenario.dungeon.dungeonCrawling
                ? "Exploration : activée"
                : "Exploration : désactivée"

        ];


        scenario.components.forEach(
            component => {

                values.push(
                    `${component.role || component.tokenType} ×${component.quantity}`
                );

            }
        );


        values.forEach(value => {

            const chip =
                document.createElement(
                    "span"
                );


            chip.textContent =
                value;


            meta.appendChild(
                chip
            );

        });

    }


    function showWarnings(
        warnings
    ) {

        const panel =
            document.getElementById(
                "warnings-panel"
            );


        const container =
            document.getElementById(
                "warnings"
            );


        if (
            !warnings ||
            !warnings.length
        ) {

            panel.hidden = true;

            container.innerHTML = "";

            return;

        }


        panel.hidden = false;


        container.innerHTML =
            warnings
                .map(
                    warning =>
                        `<p>${warning}</p>`
                )
                .join("");

    }


    function showError(error) {

        document
            .getElementById(
                "map-panel"
            )
            .hidden = true;


        document
            .getElementById(
                "error-panel"
            )
            .hidden = false;


        document
            .getElementById(
                "error-message"
            )
            .textContent =
            error.message || String(error);

    }


    function clearError() {

        document
            .getElementById(
                "error-panel"
            )
            .hidden = true;


        document
            .getElementById(
                "map-panel"
            )
            .hidden = false;

    }


    function clearMap() {

        document
            .getElementById(
                "map"
            )
            .innerHTML = "";


        document
            .getElementById(
                "minimap"
            )
            .innerHTML = "";

    }


    function generateMap() {

        clearError();

        clearMap();


        try {

            const generated =
                ScenarioAdapter.generate(
                    scenario
                );


            showWarnings(
                generated.warnings
            );


            document
                .getElementById(
                    "generation-data"
                )
                .textContent =
                `Seed ${generated.seed} • ` +
                `tentative ${generated.attempt} • ` +
                `${generated.result.map.placedTiles} tuiles`;


            MapRenderer.render(

                generated.resources,

                generated.result,

                document.getElementById(
                    "map"
                ),

                document.getElementById(
                    "minimap"
                ),

                true

            );

        }

        catch (error) {

            console.error(error);

            showError(error);

        }

    }


    function initialize() {

        try {

            scenario =
                readScenario();


            renderScenarioInfo();


            document
                .getElementById(
                    "regenerate-map"
                )
                .addEventListener(
                    "click",
                    generateMap
                );


            generateMap();

        }

        catch (error) {

            console.error(error);

            showError(error);

        }

    }


    return {

        initialize

    };

})();


document.addEventListener(

    "DOMContentLoaded",

    ScenarioPlaytest.initialize

);