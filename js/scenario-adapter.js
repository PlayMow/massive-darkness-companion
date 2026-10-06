const ScenarioAdapter = (() => {

    const MAX_ATTEMPTS = 80;
    const SEED_RANGE = 1000000;


    /*
     * Correspondance entre notre Scenario Editor
     * et les ressources existantes de MR2.
     */
    const ENVIRONMENTS = {

        "hellscape-light": {
            label: "Hellscape — Donjon",
            module: "md2-hellscape",
            skin: "light",
            from: "boxMd2CoreBox"
        },

        "hellscape-red": {
            label: "Hellscape — Enfer",
            module: "md2-hellscape",
            skin: "red",
            from: "boxMd2CoreBox"
        },

        "heavenfall": {
            label: "Heavenfall — Paradis",
            module: "md2-heavenfall",
            skin: "heaven",
            from: "boxMd2Heavenfall"
        },

        "rainbow-crossing": {
            label: "Rainbow Crossing",
            module: "md2-rainbowcrossing",
            skin: "rainbow",
            from: "boxMd2RainbowCrossing"
        },

        "crystal": {
            label: "A Quest of Crystal & Lava — Cristal",
            module: "md2-crystallava-cl",
            skin: "crystal",
            from: "boxMd2CrystalLava"
        },

        "lava": {
            label: "A Quest of Crystal & Lava — Lave",
            module: "md2-crystallava-cl",
            skin: "lava",
            from: "boxMd2CrystalLava"
        },

        "massive-darkness-1": {
            label: "Massive Darkness 1",
            module: "md1-base",
            skin: "light",
            from: "massiveDarkness1"
        }

    };

    const TILE_SETS = {

        hellscape: {
            label: "Massive Darkness 2 — Hellscape",
            module: "md2-hellscape",
            from: "boxMd2CoreBox"
        },

        heavenfall: {
            label: "Massive Darkness 2 — Heavenfall",
            module: "md2-heavenfall",
            from: "boxMd2Heavenfall"
        },

        "rainbow-crossing": {
            label: "Massive Darkness 2 — Rainbow Crossing",
            module: "md2-rainbowcrossing",
            from: "boxMd2RainbowCrossing"
        },

        "crystal-lava": {
            label: "A Quest of Crystal & Lava",
            module: "md2-crystallava-cl",
            from: "boxMd2CrystalLava"
        },

        "massive-darkness-1": {
            label: "Massive Darkness 1",
            module: "md1-base",
            from: "massiveDarkness1"
        }

    };

    const MIX_MODES = {

        mixed: {
            label: "Mélange libre",
            module: "maps-default-notuniform"
        },

        single: {
            label: "Un seul environnement aléatoire",
            module: "maps-default-uniform"
        },

        split: {
            label: "Zones distinctes",
            module: "maps-default-split"
        }

    };

    /*
     * v0.1 :
     * seuls ces deux jetons personnalisés sont encore supportés.
     */
    const SUPPORTED_TOKENS = new Set([
        "objective",
        "corruption"
    ]);


    /*
     * Position relative dans le donjon.
     *
     * 0 = proche du départ
     * 1 = très éloigné
     */
    const DISTANCE_MAP = {

        near: 0.15,

        middle: 0.50,

        far: 0.80,

        farthest: 1

    };


    function getEnvironment(scenario) {

        const id =
            scenario?.dungeon?.tiles?.environment
            || "hellscape-light";


        const environment =
            ENVIRONMENTS[id];


        if (!environment) {

            throw new Error(
                `Environnement inconnu : ${id}`
            );

        }


        return {
            id,
            ...environment
        };

    }

    function getTileSets(
        scenario
    ) {

        const ids =
            scenario
                ?.dungeon
                ?.tiles
                ?.sets
            || [
                "hellscape"
            ];


        const sets =
            ids
                .map(
                    id =>
                        TILE_SETS[id]
                )
                .filter(Boolean);


        if (!sets.length) {

            throw new Error(
                "Aucun set de tuiles valide n'a été sélectionné."
            );

        }


        return {

            ids,

            sets,

            modules: [
                ...new Set(
                    sets.map(
                        set =>
                            set.module
                    )
                )
            ],

            froms: [
                ...new Set(
                    sets.map(
                        set =>
                            set.from
                    )
                )
            ]

        };

    }

    function getMixMode(
        scenario
    ) {

        const id =
            scenario
                ?.dungeon
                ?.tiles
                ?.mixMode
            || "mixed";


        const mode =
            MIX_MODES[id];


        if (!mode) {

            throw new Error(
                `Mode d'organisation des environnements inconnu : ${id}`
            );

        }


        return {

            id,

            ...mode

        };

    }

    function normalizeSize(size) {

        if (
            size === "small" ||
            size === "normal" ||
            size === "large"
        ) {
            return size;
        }


        return "normal";

    }


    function createSeed() {

        return (
            Math.floor(
                Math.random() * SEED_RANGE
            ) + 1
        );

    }


    function createMapSeed(
        baseSeed,
        attempt
    ) {

        return (
            (
                baseSeed +
                ((attempt - 1) * 104729)
            )
            % SEED_RANGE
        ) + 1;

    }


    /*
     * Validation des fonctions que notre v0.1
     * sait réellement gérer.
     */
    function validateScenario(scenario) {

        const errors = [];
        const warnings = [];


        if (!scenario) {

            errors.push(
                "Aucun scénario n'a été fourni."
            );

        }


        if (!scenario?.dungeon) {

            errors.push(
                "La configuration du donjon est absente."
            );

        }


        const components =
            scenario?.components || [];


        components.forEach(component => {

            if (
                !SUPPORTED_TOKENS.has(
                    component.tokenType
                )
            ) {

                warnings.push(
                    `Le composant "${component.role || component.tokenType}" ` +
                    `n'est pas encore géré par Scenario Adapter v0.1.`
                );

            }


            if (
                SUPPORTED_TOKENS.has(
                    component.tokenType
                ) &&
                component.placement !== "room"
            ) {

                errors.push(
                    `"${component.role || component.tokenType}" : ` +
                    `la v0.1 supporte uniquement le placement dans les salles.`
                );

            }


            if (
                SUPPORTED_TOKENS.has(
                    component.tokenType
                ) &&
                component.distribution !== "separate"
            ) {

                errors.push(
                    `"${component.role || component.tokenType}" : ` +
                    `la v0.1 supporte uniquement "Salles / zones différentes".`
                );

            }


            if (
                Number(component.quantity) < 1
            ) {

                errors.push(
                    `"${component.role || component.tokenType}" possède une quantité invalide.`
                );

            }

        });


        if (
            scenario?.dungeon?.boss?.enabled
        ) {

            warnings.push(
                "Le Boss est défini dans le scénario, " +
                "mais son placement n'est pas encore géré en v0.1."
            );

        }


        if (errors.length) {

            throw new Error(
                "Scenario Adapter v0.1 :\n\n" +
                errors
                    .map(error => `• ${error}`)
                    .join("\n")
            );

        }


        return warnings;

    }


    /*
     * On construit une quête technique minimale.
     *
     * Son seul but est de demander à QuestGenerator
     * de produire un mapConfig valide avec les règles
     * natives de Massive Randomness 2.
     */
    function createTechnicalQuest(
        scenario
    ) {

        const title =
            scenario.title ||
            "Scénario personnalisé";


        const story =
            scenario.story || "";


        return {

            by: {
                EN: "Massive Darkness Companion",
                FR: "Massive Darkness Companion"
            },

            suggestedTilesCount:
                scenario.dungeon.size === "small"
                    ? 3
                    : scenario.dungeon.size === "large"
                        ? 5
                        : 4,

            versions: [

                {

                    labels: [
                        []
                    ],

                    title: [
                        {
                            EN: title,
                            FR: title
                        }
                    ],

                    story: [
                        {
                            EN: story,
                            FR: story
                        }
                    ],

                    rules: [],

                    /*
                     * pathToRooms est volontaire :
                     * cette structure offre des salles
                     * intéressantes pour nos objectifs.
                     */
                    map: [

                        {

                            structure: [
                                "path"
                            ],

                            skin: [
                                "default"
                            ],

                            difficulty: [
                                "default"
                            ],

                            roomLimits: [
                                "default"
                            ],

                            lootRatio: [
                                "default"
                            ],

                            corridors: [
                                "default"
                            ]

                        }

                    ],

                    boss: false

                }

            ]

        };

    }


    /*
    * Charge uniquement les ressources dont nous avons besoin.
    */
    function loadResources(
        scenario,
        tileSets,
        mixMode
    ) {

        const size =
            normalizeSize(
                scenario.dungeon.size
            );


        const needs =
            new Set([

                "bridge-default-twoexits",

                "maps-default",

                `maps-size-${size}`,

                mixMode.module,

                "quests-default"

            ]);


        /*
        * Ajoute tous les modules correspondant
        * aux sets de tuiles sélectionnés.
        */
        tileSets
            .modules
            .forEach(
                module => {

                    needs.add(
                        module
                    );

                }
            );


        const resources =
            ModManager.load({

                needs: [
                    ...needs
                ],

                excludes: []

            });


        return resources;

    }


    /*
    * maps-default charge Hellscape comme dépendance.
    *
    * Nous retirons donc toutes les tuiles physiques
    * appartenant à des sets que l'utilisateur
    * n'a pas sélectionnés.
    *
    * En mode "Mélange libre", nous ne filtrons
    * volontairement PAS les skins.
    */
    function filterEnvironmentTiles(
        resources,
        tileSets
    ) {

        const allowedFrom =
            new Set(
                tileSets.froms
            );


        resources.tiles =
            (resources.tiles || [])

                .filter(
                    tile =>

                        allowedFrom.has(
                            tile.from
                        )
                );

    }


    /*
     * Transforme les composants de notre éditeur
     * en contraintes de salles comprises par MR2.
     */
    function createRoomRequirements(
        scenario
    ) {

        const requirements = [];


        scenario.components
            .filter(
                component =>
                    SUPPORTED_TOKENS.has(
                        component.tokenType
                    )
            )
            .forEach(component => {

                const quantity =
                    Math.max(
                        1,
                        Number(
                            component.quantity
                        ) || 1
                    );


                for (
                    let i = 0;
                    i < quantity;
                    i++
                ) {

                    const token = {

                        id:
                            component.tokenType

                    };


                    if (
                        component.visibility ===
                        "visible"
                    ) {

                        token.isVisible = true;

                    }


                    const requirement = {

                        relevance: 1,

                        add: [

                            [

                                {
                                    tokens: [
                                        token
                                    ]
                                }

                            ]

                        ]

                    };


                    /*
                     * Si distance = any,
                     * on laisse MR2 choisir librement.
                     */
                    if (
                        DISTANCE_MAP[
                            component.distance
                        ] !== undefined
                    ) {

                        requirement.at =
                            DISTANCE_MAP[
                                component.distance
                            ];

                    }


                    requirements.push(
                        requirement
                    );

                }

            });


        return requirements;

    }


    function getRequestedTokens(
        scenario
    ) {

        const requested = {};


        scenario.components
            .filter(
                component =>
                    SUPPORTED_TOKENS.has(
                        component.tokenType
                    )
            )
            .forEach(component => {

                const id =
                    component.tokenType;


                if (!requested[id]) {

                    requested[id] = 0;

                }


                requested[id] +=
                    Math.max(
                        1,
                        Number(
                            component.quantity
                        ) || 1
                    );

            });


        return requested;

    }


    function validateTokenAvailability(
        resources,
        scenario
    ) {

        const requested =
            getRequestedTokens(
                scenario
            );


        for (
            const tokenId in requested
        ) {

            const available =
                resources
                    .tokensAvailable?.[
                        tokenId
                    ] || 0;


            if (
                requested[tokenId] >
                available
            ) {

                throw new Error(
                    `Le scénario demande ${requested[tokenId]} jetons "${tokenId}", ` +
                    `mais MR2 n'en possède que ${available}.`
                );

            }

        }

    }

    function tileSideMatchesRequirement(
        side,
        requirement,
        requiredSkin = null
    ) {

        if (
            requiredSkin &&
            (
                !side.skins ||
                !side.skins.includes(
                    requiredSkin
                )
            )
        ) {

            return false;

        }

        if (!side.tags) {
            return false;
        }


        /*
        * Chaque groupe de includeTags fonctionne comme :
        *
        * groupe 1 : A OU B OU C
        * ET
        * groupe 2 : D OU E
        */

        if (requirement.includeTags) {

            const includesAreValid =
                requirement.includeTags.every(
                    group =>
                        group.some(
                            tag =>
                                side.tags.includes(tag)
                        )
                );


            if (!includesAreValid) {
                return false;
            }

        }


        if (requirement.excludeTags) {

            const hasExcludedTag =
                requirement.excludeTags.some(
                    group =>
                        group.some(
                            tag =>
                                side.tags.includes(tag)
                        )
                );


            if (hasExcludedTag) {
                return false;
            }

        }


        return true;

    }

    function canAssignUniqueTiles(
        requirements,
        resources,
        requiredSkin = null
    ) {

        /*
        * Pour chaque emplacement de la map,
        * on établit la liste des tuiles compatibles.
        */

        const candidates =
            requirements.map(
                requirement =>

                    resources.tiles.filter(
                        tile =>

                            tile.sides.some(
                                side =>
                                    tileSideMatchesRequirement(
                                        side,
                                        requirement,
                                        requiredSkin
                                    )
                            )

                    )

            );


        /*
        * Si un emplacement n'a aucune tuile possible,
        * la configuration est immédiatement impossible.
        */

        if (
            candidates.some(
                list => list.length === 0
            )
        ) {

            return false;

        }


        /*
        * On commence par les contraintes
        * ayant le moins de candidats.
        */

        const ordered =
            candidates
                .slice()
                .sort(
                    (a, b) =>
                        a.length - b.length
                );


        const usedTiles =
            new Set();


        function assign(index) {

            if (
                index >= ordered.length
            ) {

                return true;

            }


            for (
                const tile of ordered[index]
            ) {

                if (
                    usedTiles.has(tile)
                ) {

                    continue;

                }


                usedTiles.add(tile);


                if (
                    assign(index + 1)
                ) {

                    return true;

                }


                usedTiles.delete(tile);

            }


            return false;

        }


        return assign(0);

    }

    function getAvailableSkins(
        resources
    ) {

        return [

            ...new Set(

                resources.tiles.flatMap(

                    tile =>

                        tile.sides.flatMap(

                            side =>
                                side.skins || []

                        )

                )

            )

        ];

    }

    function validateTileAvailability(
        resources,
        result,
        tileSets,
        mixMode
    ) {

        const requirements =
            result
                .mapConfig
                ?.mapTiles
            || [];


        if (!requirements.length) {

            throw new Error(
                "MR2 n'a fourni aucune configuration de tuiles."
            );

        }


        const skins =
            getAvailableSkins(
                resources
            );


        let isPossible =
            false;


        /*
        * ------------------------------------------------
        * MÉLANGE LIBRE
        * ------------------------------------------------
        */

        if (
            mixMode.id === "mixed"
        ) {

            isPossible =
                canAssignUniqueTiles(
                    requirements,
                    resources
                );

        }


        /*
        * ------------------------------------------------
        * UN SEUL ENVIRONNEMENT
        * ------------------------------------------------
        *
        * Il faut qu'au moins un skin puisse
        * fournir toutes les tuiles nécessaires.
        */

        else if (
            mixMode.id === "single"
        ) {

            isPossible =
                skins.some(

                    skin =>

                        canAssignUniqueTiles(
                            requirements,
                            resources,
                            skin
                        )

                );

        }


        /*
        * ------------------------------------------------
        * ZONES DISTINCTES
        * ------------------------------------------------
        *
        * Le système split natif de MR2 fonctionne
        * avec deux zones visuelles.
        */

        else if (
            mixMode.id === "split"
        ) {

            if (
                skins.length < 2
            ) {

                throw new Error(

                    "Le mode « Zones distinctes » nécessite " +
                    "au moins deux environnements visuels différents."

                );

            }


            isPossible =
                canAssignUniqueTiles(
                    requirements,
                    resources
                );

        }


        if (!isPossible) {

            const selectedSets =
                tileSets
                    .sets
                    .map(
                        set =>
                            set.label
                    )
                    .join(", ");


            throw new Error(

                `Impossible de générer cette taille de donjon avec ` +
                `le mode « ${mixMode.label} ».\n\n` +

                `Sets autorisés : ${selectedSets}\n` +

                `Tuiles nécessaires : ${requirements.length}`

            );

        }

    }


    function generatedMapSatisfiesScenario(
        result,
        scenario
    ) {

        if (
            !result.map ||
            !result.map.isValid
        ) {

            return false;

        }


        const requested =
            getRequestedTokens(
                scenario
            );


        for (
            const tokenId in requested
        ) {

            const placed =
                result
                    .map
                    .usedTokens?.[
                        tokenId
                    ] || 0;


            if (
                placed <
                requested[tokenId]
            ) {

                return false;

            }

        }


        return true;

    }


    function createAttempt(
        scenario,
        tileSets,
        mixMode,
        baseSeed,
        attempt
    ) {

        const resources =
            loadResources(
                scenario,
                tileSets,
                mixMode
            );


        const technicalQuest =
            createTechnicalQuest(
                scenario
            );


        /*
         * QuestGenerator vérifie l'existence
         * de resources.quests avant de fonctionner.
         */
        resources.quests = [
            technicalQuest
        ];


        filterEnvironmentTiles(
            resources,
            tileSets
        );


        validateTokenAvailability(
            resources,
            scenario
        );


        const mapSeed =
            createMapSeed(
                baseSeed,
                attempt
            );


        const result = {

            campaign: false,

            attempt,

            seed: baseSeed,

            questSeed: baseSeed,

            mapSeed,

            labels: {}

        };


        /*
         * On utilise QuestGenerator uniquement
         * pour obtenir le mapConfig natif MR2.
         */
        QuestGenerator.generate(

            resources,

            result,

            {
                quest:
                    technicalQuest
            }

        );


        /*
         * Maintenant nous injectons NOS contraintes.
         */
        result.mapConfig.roomsContent =
            createRoomRequirements(
                scenario
            );


        result.mapConfig.roomsHideTokens =
            Boolean(
                scenario
                    .dungeon
                    .dungeonCrawling
            );


        /*
         * Pas de fusion de salles en v0.1 :
         * cela facilite le placement de plusieurs
         * objectifs dans des salles distinctes.
         */
        result.mapConfig.roomsMerges = 0;


        validateTileAvailability(
            resources,
            result,
            tileSets,
            mixMode
        );


        /*
         * Et seulement maintenant :
         *
         * moteur original MR2.
         *
         * NE PAS MODIFIER MapGenerator.
         */
        MapGenerator.generate(
            resources,
            result
        );


        return {
            resources,
            result
        };

    }


    function generate(
        scenario,
        options = {}
    ) {

        const warnings =
            validateScenario(
                scenario
            );


        const tileSets =
            getTileSets(
                scenario
            );

            
        const mixMode =
            getMixMode(
                scenario
            );


        const baseSeed =
            Number(
                options.seed
            ) || createSeed();


        for (
            let attempt = 1;
            attempt <= MAX_ATTEMPTS;
            attempt++
        ) {

            const generated =
                createAttempt(
                    scenario,
                    tileSets,
                    mixMode,
                    baseSeed,
                    attempt
                );


            if (
                generatedMapSatisfiesScenario(
                    generated.result,
                    scenario
                )
            ) {

                return {

                    ...generated,

                    scenario,

                    tileSets,

                    mixMode,

                    warnings,

                    seed:
                        baseSeed,

                    attempt

                };

            }

        }


        throw new Error(
            `Impossible de générer une map compatible après ${MAX_ATTEMPTS} tentatives.\n\n` +
            `Essaie de réduire le nombre d'éléments, d'augmenter la taille du donjon ` +
            `ou d'assouplir les contraintes de placement.`
        );

    }


    return {

        generate,

        ENVIRONMENTS

    };

})();