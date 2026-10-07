const ScenarioEditor = (() => {

    const STORAGE_KEY =
        "MDC_SCENARIO_DRAFT_V2";

    const LEGACY_STORAGE_KEY =
        "MDC_SCENARIO_DRAFT_V1";

    const PLAYTEST_KEY =
        "MDC_PLAYTEST_SCENARIO_V1";

    const TOKEN_TYPES = [

        ["objective", "Jeton Objectif"],

        ["corruption", "Jeton Corruption"],

        ["time", "Jeton Temps"],

        ["mob", "Jeton Spawn"],

        ["regularPortal", "Portail de Monstre Errant"],

        ["regularChest", "Coffre normal"],

        ["greaterChest", "Grand coffre"],

        ["forge", "Forge"],

        ["fountain", "Fontaine"],

        ["bearTrap", "Piège à ours"],

        ["spikeTrap", "Piège à pointes"],

        ["frost", "Jeton Givre"],

        ["fire", "Jeton Feu"],

        ["pillar", "Pilier"]

    ];

    const NARRATIVE_TYPE_LABELS = {

        introduction: "Introduction",

        event: "Événement",

        boss: "Boss",

        reward: "Récompense",

        epilogue: "Épilogue",

        custom: "Personnalisé"

    };

    const TILE_ENVIRONMENTS = [

    {
        id: "hellscape-light",
        label: "Hellscape — Donjon",
        module: "md2-hellscape",
        skin: "light"
    },

    {
        id: "hellscape-red",
        label: "Hellscape — Enfer",
        module: "md2-hellscape",
        skin: "red"
    },

    {
        id: "heavenfall",
        label: "Heavenfall — Paradis",
        module: "md2-heavenfall",
        skin: "heaven"
    },

    {
        id: "rainbow-crossing",
        label: "Rainbow Crossing",
        module: "md2-rainbowcrossing",
        skin: "rainbow"
    },

    {
        id: "crystal",
        label: "A Quest of Crystal & Lava — Cristal",
        module: "md2-crystallava-cl",
        skin: "crystal"
    },

    {
        id: "lava",
        label: "A Quest of Crystal & Lava — Lave",
        module: "md2-crystallava-cl",
        skin: "lava"
    },

    {
        id: "massive-darkness-1",
        label: "Massive Darkness 1",
        module: "md1-base",
        skin: "light"
    }

    ];

    const defaultScenario = () => ({

        schemaVersion: 2,

        id:
            ScenarioSchema.createId(
                "scenario"
            ),

        revision: 1,

        title: "",

        campaign: {

            id: null,

            title: "",

            chapter: 1

        },

        narrative: [

            ScenarioSchema
                .createNarrativeBlock(
                    "introduction"
                )

        ],


        dungeon: {

            size: "normal",

            tiles: {

                sets: [
                    "hellscape"
                ],

                mixMode: "mixed"

            },

            dungeonCrawling: true,

            boss: {

                enabled: false,

                mode: "random",

                name: ""

            }

        },


        components: [

            defaultComponent(
                "objective",
                "Objectif",
                3
            ),

            defaultComponent(
                "corruption",
                "Corruption",
                4
            )

        ]

    });


    function createId() {

        if (
            window.crypto &&
            window.crypto.randomUUID
        ) {
            return window.crypto.randomUUID();
        }

        return "scenario-" + Date.now();

    }


    function defaultComponent(
        tokenType = "objective",
        role = "",
        quantity = 1
    ) {

        return {

            id: createId(),

            tokenType,

            role,

            quantity,

            placement: "room",

            distribution: "separate",

            distance: "any",

            visibility: "hidden"

        };

    }


    function tokenOptions(selected) {

        return TOKEN_TYPES

            .map(([value, label]) =>

                `<option
                    value="${value}"
                    ${value === selected ? "selected" : ""}
                >
                    ${label}
                </option>`

            )

            .join("");

    }


    function option(
        value,
        label,
        selected
    ) {

        return `
            <option
                value="${value}"
                ${value === selected ? "selected" : ""}
            >
                ${label}
            </option>
        `;

    }


    function narrativeTypeOptions(
        selected
    ) {

        return Object
            .entries(
                NARRATIVE_TYPE_LABELS
            )
            .map(
                ([value, label]) => {

                    /*
                    * L'introduction est spéciale :
                    * on ne permet pas de transformer
                    * librement un autre bloc en introduction.
                    */
                    if (
                        value === "introduction" &&
                        selected !== "introduction"
                    ) {

                        return "";

                    }


                    return option(
                        value,
                        label,
                        selected
                    );

                }
            )
            .join("");

    }


    function escapeAttribute(value) {

        return String(value ?? "")

            .replace(/&/g, "&amp;")

            .replace(/"/g, "&quot;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;");

    }


    function createComponentCard(component) {

        const card = document.createElement("article");

        card.className = "component-card";

        card.dataset.componentId = component.id;


        card.innerHTML = `

            <div class="component-card__header">

                <strong>
                    Élément de scénario
                </strong>

                <button
                    type="button"
                    class="danger-button"
                    data-action="remove"
                >
                    Supprimer
                </button>

            </div>


            <div class="form-grid form-grid--component">


                <label>

                    Type physique

                    <select data-field="tokenType">

                        ${tokenOptions(component.tokenType)}

                    </select>

                </label>


                <label>

                    Rôle narratif

                    <input
                        data-field="role"
                        type="text"
                        value="${escapeAttribute(component.role)}"
                        placeholder="Ex. Sceau du Sang"
                    >

                </label>


                <label>

                    Quantité

                    <input
                        data-field="quantity"
                        type="number"
                        min="1"
                        max="30"
                        value="${component.quantity}"
                    >

                </label>


                <label>

                    Placement

                    <select data-field="placement">

                        ${option(
                            "room",
                            "Dans des salles",
                            component.placement
                        )}

                        ${option(
                            "corridor",
                            "Dans des couloirs",
                            component.placement
                        )}

                        ${option(
                            "any",
                            "N'importe où",
                            component.placement
                        )}

                    </select>

                </label>


                <label>

                    Répartition

                    <select data-field="distribution">

                        ${option(
                            "separate",
                            "Salles / zones différentes",
                            component.distribution
                        )}

                        ${option(
                            "free",
                            "Répartition libre",
                            component.distribution
                        )}

                        ${option(
                            "grouped",
                            "Regrouper",
                            component.distribution
                        )}

                    </select>

                </label>


                <label>

                    Distance du départ

                    <select data-field="distance">

                        ${option(
                            "any",
                            "Indifférente",
                            component.distance
                        )}

                        ${option(
                            "near",
                            "Proche",
                            component.distance
                        )}

                        ${option(
                            "middle",
                            "Intermédiaire",
                            component.distance
                        )}

                        ${option(
                            "far",
                            "Éloignée",
                            component.distance
                        )}

                        ${option(
                            "farthest",
                            "Très éloignée",
                            component.distance
                        )}

                    </select>

                </label>


                <label>

                    Révélation

                    <select data-field="visibility">

                        ${option(
                            "hidden",
                            "Caché jusqu'à l'exploration",
                            component.visibility
                        )}

                        ${option(
                            "visible",
                            "Visible dès le départ",
                            component.visibility
                        )}

                    </select>

                </label>


            </div>

        `;


        card
            .querySelector('[data-action="remove"]')
            .addEventListener(
                "click",
                () => {

                    card.remove();

                    renderPreview();

                }
            );


        card
            .querySelectorAll("input, select")
            .forEach(control => {

                control.addEventListener(
                    "input",
                    renderPreview
                );

                control.addEventListener(
                    "change",
                    renderPreview
                );

            });


        return card;

    }

    function createNarrativeCard(
        block
    ) {

        const card =
            document.createElement(
                "article"
            );


        const isIntroduction =
            block.type ===
            "introduction";


        card.className =
            "narrative-card";


        card.dataset.narrativeId =
            block.id;


        card.dataset.narrativeType =
            block.type;


        card.innerHTML = `

            <div class="narrative-card__header">

                <div>

                    <strong>
                        ${
                            isIntroduction
                                ? "Introduction"
                                : "Bloc narratif"
                        }
                    </strong>

                    <small>
                        ${
                            isIntroduction
                                ? "Visible au début du scénario."
                                : "Révélation narrative du scénario."
                        }
                    </small>

                </div>


                ${
                    isIntroduction
                        ? ""
                        : `

                            <div class="narrative-card__actions">

                                <button
                                    type="button"
                                    class="secondary-button narrative-move-button"
                                    data-action="up"
                                    title="Monter"
                                >
                                    ↑
                                </button>


                                <button
                                    type="button"
                                    class="secondary-button narrative-move-button"
                                    data-action="down"
                                    title="Descendre"
                                >
                                    ↓
                                </button>


                                <button
                                    type="button"
                                    class="danger-button"
                                    data-action="remove"
                                >
                                    Supprimer
                                </button>

                            </div>

                        `
                }

            </div>


            <div class="form-grid">


                <label>

                    Type

                    <select
                        data-field="type"
                        ${isIntroduction ? "disabled" : ""}
                    >

                        ${narrativeTypeOptions(
                            block.type
                        )}

                    </select>

                </label>


                <label>

                    Titre

                    <input
                        data-field="title"
                        type="text"
                        value="${escapeAttribute(
                            block.title
                        )}"
                        placeholder="Ex. Le sceau est brisé"
                    >

                </label>


                <label class="field-full">

                    Texte

                    <textarea
                        data-field="text"
                        rows="6"
                        placeholder="Texte révélé au joueur..."
                    >${escapeAttribute(
                        block.text
                    )}</textarea>

                </label>


                <label>

                    Visibilité initiale

                    <select
                        data-field="visibility"
                        ${isIntroduction ? "disabled" : ""}
                    >

                        ${option(
                            "visible",
                            "Visible dès le départ",
                            block.visibility
                        )}

                        ${option(
                            "hidden",
                            "Caché jusqu'à révélation",
                            block.visibility
                        )}

                    </select>

                </label>


                <label
                    class="checkbox-field narrative-hide-title"
                >

                    <input
                        data-field="hideTitle"
                        type="checkbox"
                        ${
                            block.hideTitle
                                ? "checked"
                                : ""
                        }
                        ${
                            isIntroduction
                                ? "disabled"
                                : ""
                        }
                    >

                    <span>

                        <strong>
                            Cacher également le titre
                        </strong>

                        <small>
                            Évite qu'un titre révèle prématurément un événement.
                        </small>

                    </span>

                </label>


            </div>

        `;


        /*
        * Mise à jour visuelle uniquement pour l'instant.
        * Le JSON v2 sera branché à l'étape suivante.
        */
        card
            .querySelectorAll(
                "input, textarea, select"
            )
            .forEach(control => {

                control.addEventListener(
                    "input",
                    renderPreview
                );

                control.addEventListener(
                    "change",
                    renderPreview
                );

            });


        const removeButton =
            card.querySelector(
                '[data-action="remove"]'
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                () => {

                    card.remove();

                    updateNarrativeButtons();

                    renderPreview();

                }
            );

        }


        const upButton =
            card.querySelector(
                '[data-action="up"]'
            );


        if (upButton) {

            upButton.addEventListener(
                "click",
                () => {

                    const previous =
                        card.previousElementSibling;


                    /*
                    * L'introduction reste toujours
                    * le premier bloc.
                    */
                    if (
                        previous &&
                        previous.dataset
                            .narrativeType !==
                            "introduction"
                    ) {

                        card.parentElement
                            .insertBefore(
                                card,
                                previous
                            );

                    }


                    updateNarrativeButtons();

                    renderPreview();

                }
            );

        }


        const downButton =
            card.querySelector(
                '[data-action="down"]'
            );


        if (downButton) {

            downButton.addEventListener(
                "click",
                () => {

                    const next =
                        card.nextElementSibling;


                    if (next) {

                        card.parentElement
                            .insertBefore(
                                next,
                                card
                            );

                    }


                    updateNarrativeButtons();

                    renderPreview();

                }
            );

        }


        return card;

    }

    function updateNarrativeButtons() {

        const cards = [

            ...document.querySelectorAll(
                ".narrative-card"
            )

        ];


        const movableCards =
            cards.filter(
                card =>
                    card.dataset
                        .narrativeType !==
                        "introduction"
            );


        movableCards
            .forEach(
                (
                    card,
                    index
                ) => {

                    const up =
                        card.querySelector(
                            '[data-action="up"]'
                        );


                    const down =
                        card.querySelector(
                            '[data-action="down"]'
                        );


                    if (up) {

                        up.disabled =
                            index === 0;

                    }


                    if (down) {

                        down.disabled =
                            index ===
                            movableCards.length - 1;

                    }

                }
            );

    }    

    function populateTileEnvironments() {

        const select =
            document.getElementById("tile-environment");


        select.innerHTML =
            TILE_ENVIRONMENTS
                .map(environment => `
                    <option value="${environment.id}">
                        ${environment.label}
                    </option>
                `)
                .join("");

    }

    function populateTileConfiguration() {

        const setsContainer =
            document.getElementById(
                "tile-sets-list"
            );


        setsContainer.innerHTML =

            Object
                .values(
                    ScenarioCatalog.TILE_SETS
                )

                .map(
                    set => `

                        <label class="tile-set-option">

                            <input
                                type="checkbox"
                                name="tile-set"
                                value="${set.id}"
                            >

                            <span>
                                ${set.label}
                            </span>

                        </label>

                    `
                )

                .join("");


        const mixModeSelect =
            document.getElementById(
                "tile-mix-mode"
            );


        mixModeSelect.innerHTML =

            Object
                .values(
                    ScenarioCatalog.MIX_MODES
                )

                .map(
                    mode => `

                        <option value="${mode.id}">
                            ${mode.label}
                        </option>

                    `
                )

                .join("");

    }

    function readNarrativeBlocks() {

        return [

            ...document.querySelectorAll(
                ".narrative-card"
            )

        ].map(
            card => ({

                id:
                    card.dataset
                        .narrativeId,

                type:
                    card
                        .querySelector(
                            '[data-field="type"]'
                        )
                        .value,

                title:
                    card
                        .querySelector(
                            '[data-field="title"]'
                        )
                        .value
                        .trim(),

                text:
                    card
                        .querySelector(
                            '[data-field="text"]'
                        )
                        .value
                        .trim(),

                visibility:
                    card
                        .querySelector(
                            '[data-field="visibility"]'
                        )
                        .value,

                hideTitle:
                    card
                        .querySelector(
                            '[data-field="hideTitle"]'
                        )
                        .checked,

                reveal: {

                    mode: "manual",

                    trigger: null

                }

            })

        );

    }    

    function readScenario() {

        const selectedTileSets = [

            ...document.querySelectorAll(
                'input[name="tile-set"]:checked'
            )

        ].map(
            input =>
                input.value
        );


        return {

            schemaVersion: 2,

            id:
                document.body
                    .dataset
                    .scenarioId,

            revision:
                Math.max(
                    1,
                    Number(
                        document.body
                            .dataset
                            .scenarioRevision
                    ) || 1
                ),


            title:
                document
                    .getElementById(
                        "scenario-title"
                    )
                    .value
                    .trim(),


            campaign: {

                id: null,

                title:
                    document
                        .getElementById(
                            "scenario-campaign"
                        )
                        .value
                        .trim(),

                chapter:
                    Math.max(
                        1,
                        Number(
                            document
                                .getElementById(
                                    "scenario-chapter"
                                )
                                .value
                        ) || 1
                    )

            },


            narrative:
                readNarrativeBlocks(),


            dungeon: {

                size:
                    document
                        .getElementById(
                            "dungeon-size"
                        )
                        .value,


                tiles: {

                    sets:
                        selectedTileSets,

                    mixMode:
                        document
                            .getElementById(
                                "tile-mix-mode"
                            )
                            .value

                },


                dungeonCrawling:
                    document
                        .getElementById(
                            "dungeon-crawling"
                        )
                        .checked,


                boss: (() => {

                    const enabled =
                        document
                            .getElementById(
                                "boss-enabled"
                            )
                            .checked;


                    const mode =
                        enabled
                            ? document
                                .getElementById(
                                    "boss-mode"
                                )
                                .value
                            : "random";


                    const name =
                        (
                            enabled &&
                            mode === "fixed"
                        )
                            ? document
                                .getElementById(
                                    "boss-name"
                                )
                                .value
                                .trim()
                            : "";


                    return {

                        enabled,

                        mode,

                        name

                    };

                })()

            },


            components:

                [
                    ...document.querySelectorAll(
                        ".component-card"
                    )
                ]

                .map(
                    card => ({

                        id:
                            card.dataset
                                .componentId,

                        tokenType:
                            card
                                .querySelector(
                                    '[data-field="tokenType"]'
                                )
                                .value,

                        role:
                            card
                                .querySelector(
                                    '[data-field="role"]'
                                )
                                .value
                                .trim(),

                        quantity:
                            Math.max(
                                1,
                                Number(
                                    card
                                        .querySelector(
                                            '[data-field="quantity"]'
                                        )
                                        .value
                                ) || 1
                            ),

                        placement:
                            card
                                .querySelector(
                                    '[data-field="placement"]'
                                )
                                .value,

                        distribution:
                            card
                                .querySelector(
                                    '[data-field="distribution"]'
                                )
                                .value,

                        distance:
                            card
                                .querySelector(
                                    '[data-field="distance"]'
                                )
                                .value,

                        visibility:
                            card
                                .querySelector(
                                    '[data-field="visibility"]'
                                )
                                .value

                    })
                )

        };

    }


    function writeScenario(
        scenario
    ) {

        /*
        * Un ancien brouillon v1 est converti
        * automatiquement avant d'être injecté
        * dans l'interface.
        */
        scenario =
            ScenarioSchema.migrate(
                scenario
            );


        document.body
            .dataset
            .scenarioId =
            scenario.id ||
            ScenarioSchema.createId(
                "scenario"
            );


        document.body
            .dataset
            .scenarioRevision =
            String(
                scenario.revision || 1
            );


        document
            .getElementById(
                "scenario-title"
            )
            .value =
            scenario.title || "";


        document
            .getElementById(
                "scenario-campaign"
            )
            .value =
            scenario
                .campaign
                ?.title
            || "";


        document
            .getElementById(
                "scenario-chapter"
            )
            .value =
            scenario
                .campaign
                ?.chapter
            || 1;


        /*
        * NARRATION
        */

        const narrativeList =
            document.getElementById(
                "narrative-list"
            );


        narrativeList.innerHTML = "";


        const narrativeBlocks =
            (
                Array.isArray(
                    scenario.narrative
                ) &&
                scenario.narrative.length
            )
                ? scenario.narrative
                : [
                    ScenarioSchema
                        .createNarrativeBlock(
                            "introduction"
                        )
                ];


        narrativeBlocks
            .forEach(
                block => {

                    narrativeList
                        .appendChild(
                            createNarrativeCard(
                                block
                            )
                        );

                }
            );


        updateNarrativeButtons();


        /*
        * DONJON
        */

        document
            .getElementById(
                "dungeon-size"
            )
            .value =
            scenario.dungeon?.size ||
            "normal";


        const selectedSets =
            scenario
                .dungeon
                ?.tiles
                ?.sets
            || [
                "hellscape"
            ];


        document
            .querySelectorAll(
                'input[name="tile-set"]'
            )
            .forEach(
                input => {

                    input.checked =
                        selectedSets.includes(
                            input.value
                        );

                }
            );


        document
            .getElementById(
                "tile-mix-mode"
            )
            .value =
            scenario
                .dungeon
                ?.tiles
                ?.mixMode
            || "mixed";


        document
            .getElementById(
                "dungeon-crawling"
            )
            .checked =
            scenario
                .dungeon
                ?.dungeonCrawling
            ?? true;


        /*
        * BOSS
        */

        document
            .getElementById(
                "boss-enabled"
            )
            .checked =
            scenario
                .dungeon
                ?.boss
                ?.enabled
            ?? false;


        document
            .getElementById(
                "boss-mode"
            )
            .value =
            scenario
                .dungeon
                ?.boss
                ?.mode
            || "random";


        document
            .getElementById(
                "boss-name"
            )
            .value =
            scenario
                .dungeon
                ?.boss
                ?.name
            || "";


        /*
        * COMPOSANTS
        */

        const list =
            document.getElementById(
                "components-list"
            );


        list.innerHTML = "";


        (
            scenario.components || []
        )
            .forEach(
                component => {

                    list.appendChild(
                        createComponentCard(
                            component
                        )
                    );

                }
            );


        updateBossFields();

        renderPreview();

    }


    function renderPreview() {

        const scenario =
            readScenario();


        document
            .getElementById("json-preview")
            .textContent =
            JSON.stringify(
                scenario,
                null,
                2
            );


        updateBossFields();

    }


    function updateBossFields() {

        const enabled =
            document
                .getElementById(
                    "boss-enabled"
                )
                .checked;


        const modeSelect =
            document.getElementById(
                "boss-mode"
            );


        const nameInput =
            document.getElementById(
                "boss-name"
            );


        /*
        * Aucun Boss :
        * on normalise l'état.
        */
        if (!enabled) {

            modeSelect.disabled = true;

            modeSelect.value =
                "random";


            nameInput.disabled = true;

            nameInput.value = "";

            nameInput.required = false;

            return;

        }


        /*
        * Boss présent :
        * le choix random/fixed devient accessible.
        */
        modeSelect.disabled = false;


        /*
        * Boss imposé :
        * le nom est obligatoire.
        */
        if (
            modeSelect.value ===
            "fixed"
        ) {

            nameInput.disabled = false;

            nameInput.required = true;

        }

        /*
        * Boss aléatoire :
        * aucun nom ne doit être conservé.
        */
        else {

            nameInput.disabled = true;

            nameInput.value = "";

            nameInput.required = false;

        }

    }


    function saveDraft() {

        const scenario =
            readScenario();


        /*
        * ------------------------------------------------
        * BROUILLON
        * ------------------------------------------------
        *
        * Le brouillon est toujours sauvegardé,
        * même si le scénario est encore incomplet.
        */

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                scenario
            )

        );


        /*
        * ------------------------------------------------
        * VALIDATION
        * ------------------------------------------------
        */

        const validation =
            ScenarioSchema.validate(
                scenario
            );


        /*
        * Un scénario incomplet reste un brouillon.
        *
        * On ne remplace pas une éventuelle version
        * valide déjà présente dans la bibliothèque.
        */

        if (
            !validation.valid
        ) {

            setStatus(
                "Brouillon enregistré — scénario incomplet, bibliothèque inchangée."
            );


            return;

        }


        /*
        * ------------------------------------------------
        * BIBLIOTHÈQUE
        * ------------------------------------------------
        */

        try {

            ScenarioStore.save(
                scenario
            );


            setStatus(
                "Brouillon et scénario enregistrés dans la bibliothèque."
            );

        }

        catch (error) {

            console.error(
                error
            );


            setStatus(
                "Brouillon enregistré, mais erreur lors de la mise à jour de la bibliothèque."
            );

        }

    }


    function loadDraft() {

        const currentRaw =
            localStorage.getItem(
                STORAGE_KEY
            );


        const legacyRaw =
            localStorage.getItem(
                LEGACY_STORAGE_KEY
            );


        const raw =
            currentRaw ||
            legacyRaw;


        if (!raw) {

            return false;

        }


        try {

            const parsed =
                JSON.parse(
                    raw
                );


            const migrated =
                ScenarioSchema.migrate(
                    parsed
                );


            writeScenario(
                migrated
            );


            /*
            * Si nous venons d'un ancien brouillon v1,
            * nous créons immédiatement une copie v2.
            *
            * L'ancien brouillon est volontairement
            * conservé comme filet de sécurité.
            */
            if (!currentRaw) {

                localStorage.setItem(

                    STORAGE_KEY,

                    JSON.stringify(
                        migrated
                    )

                );


                setStatus(
                    "Ancien brouillon migré vers le schéma v2."
                );

            }

            else {

                setStatus(
                    "Brouillon local chargé."
                );

            }


            return true;

        }

        catch (error) {

            console.error(
                error
            );

            return false;

        }

    }


    function exportScenario() {

        const scenario =
            readScenario();


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        scenario,
                        null,
                        2
                    )
                ],
                {
                    type: "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        const safeName =
            (
                scenario.title ||
                "scenario"
            )

            .toLowerCase()

            .normalize("NFD")

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .replace(
                /[^a-z0-9]+/g,
                "-"
            )

            .replace(
                /^-|-$/g,
                ""
            );


        link.href = url;


        link.download =
            `${safeName || "scenario"}.mdc-scenario.json`;


        link.click();


        URL.revokeObjectURL(url);


        setStatus(
            "Scénario exporté."
        );

    }


    function setStatus(message) {

        const status =
            document.getElementById(
                "editor-status"
            );


        status.textContent =
            message;


        window.clearTimeout(
            setStatus.timeout
        );


        setStatus.timeout =
            window.setTimeout(
                () => {

                    status.textContent = "";

                },
                2500
            );

    }

    function validateScenarioForPlaytest(
        scenario
    ) {

        const validation =
            ScenarioSchema.validate(
                scenario
            );


        if (
            validation.valid
        ) {

            return true;

        }


        const message =

            "Impossible de lancer le Playtest.\n\n" +

            validation.errors
                .map(
                    error =>
                        `• ${error}`
                )
                .join("\n");


        window.alert(
            message
        );


        setStatus(
            "Le scénario contient des erreurs."
        );


        return false;

    }

    function playtestScenario() {

        const scenario =
            readScenario();

        if (
            !validateScenarioForPlaytest(
                scenario
            )
        ) {

            return;

        }            

        /*
        * On sauvegarde également le brouillon :
        * revenir depuis le Playtest ne fera donc
        * pas perdre les modifications.
        */
        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(
                scenario
            )

        );


        /*
        * sessionStorage sert à transmettre
        * précisément cette version au Playtest.
        */
        sessionStorage.setItem(

            PLAYTEST_KEY,

            JSON.stringify(
                scenario
            )

        );


        window.location.href =
            "scenario-playtest.html";

    }

    function initialize() {

        populateTileConfiguration();

        document
            .getElementById(
                "add-narrative"
            )
            .addEventListener(
                "click",
                () => {

                    const block =
                        ScenarioSchema
                            .createNarrativeBlock(
                                "event"
                            );


                    document
                        .getElementById(
                            "narrative-list"
                        )
                        .appendChild(
                            createNarrativeCard(
                                block
                            )
                        );


                    updateNarrativeButtons();

                    renderPreview();

                }
            );

        document
            .getElementById("add-component")
            .addEventListener(
                "click",
                () => {

                    document
                        .getElementById(
                            "components-list"
                        )
                        .appendChild(
                            createComponentCard(
                                defaultComponent()
                            )
                        );


                    renderPreview();

                }
            );


        document
            .getElementById("save-draft")
            .addEventListener(
                "click",
                saveDraft
            );

        document
            .getElementById(
                "playtest-scenario"
            )
            .addEventListener(
                "click",
                playtestScenario
            );

        document
            .getElementById("export-scenario")
            .addEventListener(
                "click",
                exportScenario
            );


        document
            .querySelectorAll(
                "#scenario-form input, " +
                "#scenario-form textarea, " +
                "#scenario-form select"
            )

            .forEach(control => {

                control.addEventListener(
                    "input",
                    renderPreview
                );

                control.addEventListener(
                    "change",
                    renderPreview
                );

            });


        if (!loadDraft()) {

            writeScenario(
                defaultScenario()
            );

        }

    }


    return {

        initialize

    };

})();


document.addEventListener(
    "DOMContentLoaded",
    ScenarioEditor.initialize
);