const ScenarioPlaytest = (() => {

    const PLAYTEST_KEY =
        "MDC_PLAYTEST_SCENARIO_V1";


    const DRAFT_KEY =
        "MDC_SCENARIO_DRAFT_V2";


    const LEGACY_DRAFT_KEY =
        "MDC_SCENARIO_DRAFT_V1";


    const SAVE_PREFIX =
        "MDC_PLAYTEST_SAVE_V1_";


    let scenario;

    const revealedNarrativeBlocks =
        new Set();

    let saveId = null;

    let saveCreatedAt = null;


    let generationState = {

        seed: null,

        questSeed: null,

        mapSeed: null,

        attempt: null

    };        

    function getSaveKey() {

        return (
            SAVE_PREFIX +
            scenario.id
        );

    }


    function loadPlaytestState() {

        const raw =
            localStorage.getItem(
                getSaveKey()
            );


        if (!raw) {

            return;

        }


        try {

            const save =
                JSON.parse(
                    raw
                );


            (
                save
                    .narrative
                    ?.revealed
                || []
            )
                .forEach(
                    id => {

                        revealedNarrativeBlocks
                            .add(
                                id
                            );

                    }
                );

            saveId =
                save.id || null;


            saveCreatedAt =
                save.createdAt || null;


            const generation =
                save.generation || {};


            generationState = {

                seed:
                    Number(
                        generation.seed
                    ) || null,

                questSeed:
                    Number(
                        generation.questSeed
                    ) || null,

                mapSeed:
                    Number(
                        generation.mapSeed
                    ) || null,

                attempt:
                    Number(
                        generation.attempt
                    ) || null

            };                

        }

        catch (error) {

            console.error(
                "Impossible de charger la sauvegarde du Playtest.",
                error
            );

        }

    }


    function savePlaytestState() {

        const now =
            new Date()
                .toISOString();


        if (!saveId) {

            saveId =
                ScenarioSchema.createId(
                    "save"
                );

        }


        if (!saveCreatedAt) {

            saveCreatedAt =
                now;

        }


        const save = {

            saveSchemaVersion: 1,

            id:
                saveId,


            scenarioId:
                scenario.id,

            scenarioRevision:
                scenario.revision || 1,


            status:
                "in-progress",


            createdAt:
                saveCreatedAt,

            updatedAt:
                now,


            generation: {

                seed:
                    generationState.seed,

                questSeed:
                    generationState.questSeed,

                mapSeed:
                    generationState.mapSeed,

                attempt:
                    generationState.attempt

            },


            narrative: {

                revealed: [
                    ...revealedNarrativeBlocks
                ]

            }

        };


        localStorage.setItem(

            getSaveKey(),

            JSON.stringify(
                save
            )

        );

    }

    const NARRATIVE_TYPE_LABELS = {

        introduction:
            "Introduction",

        event:
            "Événement",

        boss:
            "Boss",

        reward:
            "Récompense",

        epilogue:
            "Épilogue",

        custom:
            "Narration"

    };

    function readScenario() {

        const raw =
            sessionStorage.getItem(
                PLAYTEST_KEY
            )

            ||

            localStorage.getItem(
                DRAFT_KEY
            )

            ||

            localStorage.getItem(
                LEGACY_DRAFT_KEY
            );


        if (!raw) {

            throw new Error(
                "Aucun scénario à tester.\n\n" +
                "Retourne dans le Scenario Editor et clique sur « Tester le scénario »."
            );

        }


        const parsed =
            JSON.parse(
                raw
            );


        /*
        * Le Playtest travaille toujours
        * avec le format courant.
        *
        * Un ancien scénario v1 sera donc
        * automatiquement converti en v2.
        */
        return ScenarioSchema.migrate(
            parsed
        );

    }


    function renderScenarioInfo() {

        /*
        * ------------------------------------------------
        * TITRE
        * ------------------------------------------------
        */

        document
            .getElementById(
                "scenario-title"
            )
            .textContent =
            scenario.title ||
            "Scénario sans titre";


        /*
        * ------------------------------------------------
        * CAMPAGNE / CHAPITRE
        * ------------------------------------------------
        */

        const campaignTitle =
            scenario
                .campaign
                ?.title
            || "";


        const chapter =
            scenario
                .campaign
                ?.chapter
            || 1;


        document
            .getElementById(
                "scenario-campaign"
            )
            .textContent =

            campaignTitle

                ? `${campaignTitle} • Chapitre ${chapter}`

                : `Chapitre ${chapter}`;


        /*
        * ------------------------------------------------
        * MÉTADONNÉES
        * ------------------------------------------------
        */

        const meta =
            document.getElementById(
                "scenario-meta"
            );


        meta.innerHTML = "";


        const sizeLabels = {

            small:
                "Petit",

            normal:
                "Normal",

            large:
                "Grand"

        };


        const selectedSets =
            scenario
                .dungeon
                ?.tiles
                ?.sets
            || [];


        const setLabels =
            selectedSets.map(
                id =>
                    ScenarioCatalog
                        .TILE_SETS[
                            id
                        ]
                        ?.label
                    || id
            );


        const mixModeId =
            scenario
                .dungeon
                ?.tiles
                ?.mixMode
            || "mixed";


        const mixModeLabel =
            ScenarioCatalog
                .MIX_MODES[
                    mixModeId
                ]
                ?.label
            || mixModeId;


        const values = [

            `Taille : ${
                sizeLabels[
                    scenario.dungeon.size
                ]
                ||
                scenario.dungeon.size
            }`,

            `Sets : ${
                setLabels.join(" • ")
            }`,

            `Organisation : ${
                mixModeLabel
            }`,

            scenario
                .dungeon
                .dungeonCrawling

                ? "Exploration : activée"

                : "Exploration : désactivée"

        ];


        scenario.components
            .forEach(
                component => {

                    values.push(
                        `${component.role || component.tokenType} ×${component.quantity}`
                    );

                }
            );


        values.forEach(
            value => {

                const chip =
                    document.createElement(
                        "span"
                    );


                chip.textContent =
                    value;


                meta.appendChild(
                    chip
                );

            }
        );

    }

    function createNarrativeCard(
        block
    ) {

        const revealed =
            block.visibility ===
                "visible"

            ||

            revealedNarrativeBlocks
                .has(
                    block.id
                );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "playtest-narrative-card";


        /*
        * TYPE
        */

        const type =
            document.createElement(
                "div"
            );


        type.className =
            "playtest-narrative-type";


        type.textContent =
            NARRATIVE_TYPE_LABELS[
                block.type
            ]
            ||
            "Narration";


        card.appendChild(
            type
        );


        /*
        * TITRE
        */

        const title =
            document.createElement(
                "h4"
            );


        if (
            !revealed &&
            block.hideTitle
        ) {

            title.textContent =
                "Événement caché";

            card.classList.add(
                "is-secret"
            );

        }

        else {

            title.textContent =
                block.title ||
                "Sans titre";

        }


        card.appendChild(
            title
        );


        /*
        * CONTENU RÉVÉLÉ
        */

        if (revealed) {

            const text =
                document.createElement(
                    "p"
                );


            text.className =
                "playtest-narrative-text";


            text.textContent =
                block.text || "";


            card.appendChild(
                text
            );


            return card;

        }


        /*
        * CONTENU CACHÉ
        */

        const locked =
            document.createElement(
                "div"
            );


        locked.className =
            "playtest-narrative-locked";


        const message =
            document.createElement(
                "span"
            );


        message.textContent =
            "Contenu caché";


        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "primary-button";


        button.textContent =
            "Révéler";


        button.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Révéler ce contenu caché ?\n\nCette action peut dévoiler un élément important de la quête."
                    );


                if (!confirmed) {

                    return;

                }


                revealedNarrativeBlocks
                    .add(
                        block.id
                    );

                savePlaytestState();
                
                renderNarrative();

            }
        );


        locked.appendChild(
            message
        );


        locked.appendChild(
            button
        );


        card.appendChild(
            locked
        );


        return card;

    }    

    function renderNarrative() {

        const container =
            document.getElementById(
                "narrative-list"
            );


        container.innerHTML =
            "";


        const blocks =
            scenario.narrative || [];


        blocks.forEach(
            block => {

                container.appendChild(
                    createNarrativeCard(
                        block
                    )
                );

            }
        );

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


    function generateMap(
        forceNew = false
    ) {

        clearError();

        clearMap();


        try {

            const options = {};


            /*
            * Si une génération a déjà été sauvegardée,
            * on réutilise sa seed.
            *
            * Si forceNew = true, on laisse l'Adapter
            * créer une nouvelle seed.
            */
            if (
                !forceNew &&
                generationState.seed
            ) {

                options.seed =
                    generationState.seed;

            }


            const generated =
                ScenarioAdapter.generate(
                    scenario,
                    options
                );


            /*
            * Mémorisation de la génération réellement
            * retenue par Scenario Adapter.
            */
            generationState = {

                seed:
                    generated.seed,

                questSeed:
                    generated
                        .result
                        ?.questSeed
                    ?? generated.seed,

                mapSeed:
                    generated
                        .result
                        ?.mapSeed
                    ?? null,

                attempt:
                    generated.attempt

            };


            /*
            * La génération devient immédiatement
            * persistante.
            */
            savePlaytestState();


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

            console.error(
                error
            );


            showError(
                error
            );

        }

    }


    function initialize() {

        try {

        scenario =
            readScenario();


        loadPlaytestState();


        renderScenarioInfo();

        renderNarrative();


            document
                .getElementById(
                    "regenerate-map"
                )
                .addEventListener(
                    "click",
                    () => {

                        generateMap(
                            true
                        );

                    }
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