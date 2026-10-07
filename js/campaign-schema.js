window.CampaignSchema = (() => {

    const CURRENT_VERSION = 1;


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


    function createChapter(
        title = ""
    ) {

        return {

            id:
                createId(
                    "chapter"
                ),

            title,

            scenarios: []

        };

    }


    function createCampaign() {

        return {

            schemaVersion:
                CURRENT_VERSION,

            id:
                createId(
                    "campaign"
                ),

            revision: 1,

            title: "",

            description: "",

            chapters: [

                createChapter(
                    "Chapitre 1"
                )

            ]

        };

    }


    function migrate(
        campaign
    ) {

        if (!campaign) {

            return null;

        }


        if (
            Number(
                campaign.schemaVersion
            ) === CURRENT_VERSION
        ) {

            return campaign;

        }


        throw new Error(
            `Version de campagne non supportée : ${campaign.schemaVersion}`
        );

    }


    function validate(
        campaign
    ) {

        const errors = [];
        const warnings = [];


        if (!campaign) {

            errors.push(
                "La campagne est absente."
            );


            return {

                valid: false,

                errors,

                warnings

            };

        }


        /*
         * SCHÉMA
         */

        if (
            campaign.schemaVersion !==
            CURRENT_VERSION
        ) {

            errors.push(
                `La campagne doit utiliser le schéma v${CURRENT_VERSION}.`
            );

        }


        /*
         * IDENTITÉ
         */

        if (!campaign.id) {

            errors.push(
                "La campagne ne possède pas d'identifiant."
            );

        }


        if (
            !Number.isInteger(
                campaign.revision
            ) ||
            campaign.revision < 1
        ) {

            errors.push(
                "La révision de la campagne doit être un entier supérieur ou égal à 1."
            );

        }


        if (
            !campaign.title ||
            !campaign.title.trim()
        ) {

            errors.push(
                "Le titre de la campagne est obligatoire."
            );

        }


        /*
         * CHAPITRES
         */

        if (
            !Array.isArray(
                campaign.chapters
            ) ||
            campaign.chapters.length === 0
        ) {

            errors.push(
                "La campagne doit contenir au moins un chapitre."
            );


            return {

                valid:
                    errors.length === 0,

                errors,

                warnings

            };

        }


        const chapterIds =
            new Set();


        /*
         * Un scénario ne peut apparaître
         * qu'une seule fois dans une campagne.
         *
         * Cela garantit une progression
         * linéaire et non ambiguë.
         */
        const scenarioIds =
            new Set();


        campaign.chapters
            .forEach(
                (
                    chapter,
                    chapterIndex
                ) => {

                    const chapterNumber =
                        chapterIndex + 1;


                    /*
                     * ID DU CHAPITRE
                     */

                    if (!chapter.id) {

                        errors.push(
                            `Chapitre ${chapterNumber} : identifiant absent.`
                        );

                    }

                    else if (
                        chapterIds.has(
                            chapter.id
                        )
                    ) {

                        errors.push(
                            `Identifiant de chapitre dupliqué : ${chapter.id}`
                        );

                    }

                    else {

                        chapterIds.add(
                            chapter.id
                        );

                    }


                    /*
                     * TITRE DU CHAPITRE
                     */

                    if (
                        !chapter.title ||
                        !chapter.title.trim()
                    ) {

                        errors.push(
                            `Chapitre ${chapterNumber} : titre obligatoire.`
                        );

                    }


                    /*
                     * SCÉNARIOS
                     */

                    if (
                        !Array.isArray(
                            chapter.scenarios
                        ) ||
                        chapter.scenarios.length === 0
                    ) {

                        errors.push(
                            `Chapitre ${chapterNumber} : au moins un scénario est obligatoire.`
                        );


                        return;

                    }


                    chapter.scenarios
                        .forEach(
                            (
                                scenarioId,
                                scenarioIndex
                            ) => {

                                if (
                                    !scenarioId ||
                                    typeof scenarioId !==
                                    "string"
                                ) {

                                    errors.push(
                                        `Chapitre ${chapterNumber}, scénario ${scenarioIndex + 1} : identifiant invalide.`
                                    );


                                    return;

                                }


                                /*
                                 * DOUBLON DANS LA CAMPAGNE
                                 */

                                if (
                                    scenarioIds.has(
                                        scenarioId
                                    )
                                ) {

                                    errors.push(
                                        `Le scénario ${scenarioId} est utilisé plusieurs fois dans la campagne.`
                                    );

                                }

                                else {

                                    scenarioIds.add(
                                        scenarioId
                                    );

                                }


                                /*
                                 * EXISTENCE DANS LA
                                 * BIBLIOTHÈQUE
                                 */

                                if (
                                    !ScenarioStore.has(
                                        scenarioId
                                    )
                                ) {

                                    errors.push(
                                        `Le scénario ${scenarioId} n'existe pas dans la bibliothèque.`
                                    );

                                }

                            }
                        );

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

        createId,

        createChapter,

        createCampaign,

        migrate,

        validate

    };

})();