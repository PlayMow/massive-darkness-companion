window.ScenarioSchema = (() => {

    const CURRENT_VERSION = 2;


    const NARRATIVE_TYPES = [
        "introduction",
        "event",
        "boss",
        "reward",
        "epilogue",
        "custom"
    ];


    const VISIBILITIES = [
        "visible",
        "hidden"
    ];


    const MIX_MODES = [
        "mixed",
        "single",
        "split"
    ];


    const DUNGEON_SIZES = [
        "small",
        "normal",
        "large"
    ];


    function createId(
        prefix = "item"
    ) {

        const uuid =
            (
                window.crypto &&
                window.crypto.randomUUID
            )
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random()
                    .toString(16)
                    .slice(2)}`;


        return `${prefix}-${uuid}`;

    }


    function createNarrativeBlock(
        type = "event"
    ) {

        const isIntroduction =
            type === "introduction";


        return {

            id:
                createId(
                    "narrative"
                ),

            type,

            title:
                isIntroduction
                    ? "Introduction"
                    : "",

            text: "",

            visibility:
                isIntroduction
                    ? "visible"
                    : "hidden",

            hideTitle: false,

            reveal: {

                mode: "manual",

                trigger: null

            }

        };

    }


    function migrateV1(
        scenario
    ) {

        const introduction =
            createNarrativeBlock(
                "introduction"
            );


        introduction.text =
            scenario.story || "";


        return {

            schemaVersion: 2,

            /*
             * On conserve l'ID existant.
             * Une migration ne doit jamais
             * créer un nouveau scénario.
             */
            id:
                scenario.id ||
                createId("scenario"),

            revision: 1,


            title:
                scenario.title || "",


            campaign: {

                id: null,

                title:
                    scenario.campaign || "",

                chapter:
                    scenario.chapter || 1

            },


            narrative: [
                introduction
            ],


            dungeon: {

                size:
                    scenario
                        .dungeon
                        ?.size
                    || "normal",


                tiles: {

                    sets:
                        scenario
                            .dungeon
                            ?.tiles
                            ?.sets
                        || [
                            "hellscape"
                        ],

                    mixMode:
                        scenario
                            .dungeon
                            ?.tiles
                            ?.mixMode
                        || "mixed"

                },


                dungeonCrawling:
                    scenario
                        .dungeon
                        ?.dungeonCrawling
                    ?? true,


                boss: {

                    enabled:
                        scenario
                            .dungeon
                            ?.boss
                            ?.enabled
                        ?? false,

                    mode:
                        scenario
                            .dungeon
                            ?.boss
                            ?.mode
                        || "random",

                    name:
                        scenario
                            .dungeon
                            ?.boss
                            ?.name
                        || ""

                }

            },


            components:
                scenario.components || []

        };

    }


    function migrate(
        scenario
    ) {

        if (!scenario) {

            return null;

        }


        if (
            Number(
                scenario.schemaVersion
            ) === CURRENT_VERSION
        ) {

            return scenario;

        }


        /*
         * Ancien format actuel.
         */
        if (
            !scenario.schemaVersion ||
            Number(
                scenario.schemaVersion
            ) === 1
        ) {

            return migrateV1(
                scenario
            );

        }


        throw new Error(
            `Version de scénario non supportée : ${scenario.schemaVersion}`
        );

    }


    function validate(
        scenario
    ) {

        const errors = [];
        const warnings = [];


        if (!scenario) {

            errors.push(
                "Le scénario est absent."
            );


            return {
                valid: false,
                errors,
                warnings
            };

        }


        if (
            scenario.schemaVersion !==
            CURRENT_VERSION
        ) {

            errors.push(
                `Le scénario doit utiliser le schéma v${CURRENT_VERSION}.`
            );

        }


        if (!scenario.id) {

            errors.push(
                "Le scénario ne possède pas d'identifiant."
            );

        }


        if (
            !Number.isInteger(
                scenario.revision
            ) ||
            scenario.revision < 1
        ) {

            errors.push(
                "La révision du scénario doit être un entier supérieur ou égal à 1."
            );

        }


        if (
            !scenario.title ||
            !scenario.title.trim()
        ) {

            errors.push(
                "Le titre du scénario est obligatoire."
            );

        }


        /*
         * NARRATION
         */

        if (
            !Array.isArray(
                scenario.narrative
            )
        ) {

            errors.push(
                "La liste des blocs narratifs est absente."
            );

        }

        else {

            const ids =
                new Set();


            const introductions =
                scenario.narrative.filter(
                    block =>
                        block.type ===
                        "introduction"
                );


            if (
                introductions.length !== 1
            ) {

                errors.push(
                    "Le scénario doit contenir exactement une introduction."
                );

            }


            if (
                scenario.narrative.length &&
                scenario.narrative[0]
                    .type !==
                    "introduction"
            ) {

                errors.push(
                    "L'introduction doit être le premier bloc narratif."
                );

            }


            scenario.narrative
                .forEach(
                    (
                        block,
                        index
                    ) => {

                        if (!block.id) {

                            errors.push(
                                `Bloc narratif ${index + 1} : identifiant absent.`
                            );

                        }

                        else if (
                            ids.has(
                                block.id
                            )
                        ) {

                            errors.push(
                                `Identifiant narratif dupliqué : ${block.id}`
                            );

                        }

                        else {

                            ids.add(
                                block.id
                            );

                        }


                        if (
                            !NARRATIVE_TYPES.includes(
                                block.type
                            )
                        ) {

                            errors.push(
                                `Bloc narratif ${index + 1} : type inconnu.`
                            );

                        }


                        if (
                            !block.title ||
                            !block.title.trim()
                        ) {

                            errors.push(
                                `Bloc narratif ${index + 1} : titre obligatoire.`
                            );

                        }


                        if (
                            !VISIBILITIES.includes(
                                block.visibility
                            )
                        ) {

                            errors.push(
                                `Bloc narratif ${index + 1} : visibilité invalide.`
                            );

                        }


                        if (
                            typeof block.hideTitle !==
                            "boolean"
                        ) {

                            errors.push(
                                `Bloc narratif ${index + 1} : hideTitle doit être un booléen.`
                            );

                        }


                        if (
                            block.reveal?.mode !==
                            "manual"
                        ) {

                            errors.push(
                                `Bloc narratif ${index + 1} : seul le mode de révélation manuel est supporté actuellement.`
                            );

                        }

                    }
                );

        }


        /*
         * DONJON
         */

        if (
            !DUNGEON_SIZES.includes(
                scenario
                    .dungeon
                    ?.size
            )
        ) {

            errors.push(
                "Taille de donjon invalide."
            );

        }


        const sets =
            scenario
                .dungeon
                ?.tiles
                ?.sets;


        if (
            !Array.isArray(sets) ||
            sets.length === 0
        ) {

            errors.push(
                "Au moins un set de tuiles doit être sélectionné."
            );

        }


        if (
            !MIX_MODES.includes(
                scenario
                    .dungeon
                    ?.tiles
                    ?.mixMode
            )
        ) {

            errors.push(
                "Mode d'organisation des environnements invalide."
            );

        }


        /*
         * BOSS
         */

        const boss =
            scenario
                .dungeon
                ?.boss;


        if (boss) {

            if (
                ![
                    "random",
                    "fixed"
                ].includes(
                    boss.mode
                )
            ) {

                errors.push(
                    "Mode de Boss invalide."
                );

            }


            if (
                (
                    !boss.enabled ||
                    boss.mode === "random"
                ) &&
                boss.name
            ) {

                errors.push(
                    "Un Boss aléatoire ou désactivé ne peut pas avoir de nom imposé."
                );

            }


            if (
                boss.enabled &&
                boss.mode === "fixed" &&
                !boss.name?.trim()
            ) {

                errors.push(
                    "Le nom du Boss est obligatoire lorsqu'un Boss imposé est sélectionné."
                );

            }

        }


        /*
         * COMPOSANTS
         */

        const componentIds =
            new Set();


        (
            scenario.components || []
        )
            .forEach(
                (
                    component,
                    index
                ) => {

                    if (!component.id) {

                        errors.push(
                            `Composant ${index + 1} : identifiant absent.`
                        );

                    }

                    else if (
                        componentIds.has(
                            component.id
                        )
                    ) {

                        errors.push(
                            `Identifiant de composant dupliqué : ${component.id}`
                        );

                    }

                    else {

                        componentIds.add(
                            component.id
                        );

                    }


                    if (
                        !Number.isInteger(
                            Number(
                                component.quantity
                            )
                        ) ||
                        Number(
                            component.quantity
                        ) < 1
                    ) {

                        errors.push(
                            `Composant ${index + 1} : quantité invalide.`
                        );

                    }

                }
            );


        return {

            valid:
                errors.length === 0,

            errors,

            warnings

        };

    }


    return {

        CURRENT_VERSION,

        NARRATIVE_TYPES,

        createId,

        createNarrativeBlock,

        migrate,

        validate

    };

})();