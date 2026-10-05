const ScenarioEditor = (() => {

    const STORAGE_KEY = "MDC_SCENARIO_DRAFT_V1";

    const PLAYTEST_KEY = "MDC_PLAYTEST_SCENARIO_V1";

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

        schemaVersion: 1,

        id: createId(),

        title: "",

        campaign: "",

        chapter: 1,

        story: "",


        dungeon: {

            size: "normal",

            tiles: {
                environment: "hellscape-light",
                module: "md2-hellscape",
                skin: "light"
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

    function readScenario() {

        const selectedEnvironmentId =
            document
                .getElementById("tile-environment")
                .value;


        const selectedEnvironment =
            TILE_ENVIRONMENTS.find(
                environment =>
                    environment.id === selectedEnvironmentId
            ) || TILE_ENVIRONMENTS[0];
        
        return {

            schemaVersion: 1,

            id: document.body.dataset.scenarioId,


            title:
                document
                    .getElementById("scenario-title")
                    .value
                    .trim(),


            campaign:
                document
                    .getElementById("scenario-campaign")
                    .value
                    .trim(),


            chapter:
                Math.max(
                    1,
                    Number(
                        document
                            .getElementById("scenario-chapter")
                            .value
                    ) || 1
                ),


            story:
                document
                    .getElementById("scenario-story")
                    .value
                    .trim(),


            dungeon: {

                size:
                    document
                        .getElementById("dungeon-size")
                        .value,

                tiles: {

                    environment:
                        selectedEnvironment.id,

                    module:
                        selectedEnvironment.module,

                    skin:
                        selectedEnvironment.skin

                },


                dungeonCrawling:
                    document
                        .getElementById("dungeon-crawling")
                        .checked,


                boss: {

                    enabled:
                        document
                            .getElementById("boss-enabled")
                            .checked,


                    mode:
                        document
                            .getElementById("boss-mode")
                            .value,


                    name:
                        document
                            .getElementById("boss-name")
                            .value
                            .trim()

                }

            },


            components:

                [
                    ...document.querySelectorAll(
                        ".component-card"
                    )
                ]

                .map(card => ({

                    id:
                        card.dataset.componentId,


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

                }))

        };

    }


    function writeScenario(scenario) {

        document.body.dataset.scenarioId =
            scenario.id || createId();


        document
            .getElementById("scenario-title")
            .value =
            scenario.title || "";


        document
            .getElementById("scenario-campaign")
            .value =
            scenario.campaign || "";


        document
            .getElementById("scenario-chapter")
            .value =
            scenario.chapter || 1;


        document
            .getElementById("scenario-story")
            .value =
            scenario.story || "";


        document
            .getElementById("dungeon-size")
            .value =
            scenario.dungeon?.size || "normal";


        document
            .getElementById("tile-environment")
            .value =
            scenario.dungeon?.tiles?.environment
            || "hellscape-light";


        document
            .getElementById("dungeon-crawling")
            .checked =
            scenario.dungeon?.dungeonCrawling ?? true;


        document
            .getElementById("boss-enabled")
            .checked =
            scenario.dungeon?.boss?.enabled ?? false;


        document
            .getElementById("boss-mode")
            .value =
            scenario.dungeon?.boss?.mode || "random";


        document
            .getElementById("boss-name")
            .value =
            scenario.dungeon?.boss?.name || "";


        const list =
            document.getElementById(
                "components-list"
            );


        list.innerHTML = "";


        (scenario.components || [])

            .forEach(component => {

                list.appendChild(
                    createComponentCard(component)
                );

            });


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
                .getElementById("boss-enabled")
                .checked;


        document
            .getElementById("boss-mode")
            .disabled =
            !enabled;


        document
            .getElementById("boss-name")
            .disabled =
            !enabled;

    }


    function saveDraft() {

        const scenario =
            readScenario();


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(scenario)
        );


        setStatus(
            "Brouillon enregistré localement."
        );

    }


    function loadDraft() {

        const raw =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!raw)
            return false;


        try {

            writeScenario(
                JSON.parse(raw)
            );


            setStatus(
                "Brouillon local chargé."
            );


            return true;

        }

        catch (error) {

            console.error(error);

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

    function playtestScenario() {

        const scenario =
            readScenario();


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

        populateTileEnvironments();

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