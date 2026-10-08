window.CampaignProgress = (() => {

    const SAVE_SCHEMA_VERSION = 1;


    const SAVE_PREFIX =
        "MDC_CAMPAIGN_PROGRESS_V1_";


    function getSaveKey(
        campaignId
    ) {

        return (
            SAVE_PREFIX +
            campaignId
        );

    }


    /*
     * ------------------------------------------------
     * CRÉATION
     * ------------------------------------------------
     */

    function create(
        campaign
    ) {

        const validation =
            CampaignSchema.validate(
                campaign
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Impossible de créer une progression pour une campagne invalide.\n\n" +

                validation.errors
                    .map(
                        error =>
                            `• ${error}`
                    )
                    .join("\n")

            );

        }


        const now =
            new Date()
                .toISOString();


        return {

            saveSchemaVersion:
                SAVE_SCHEMA_VERSION,


            campaignId:
                campaign.id,


            campaignRevision:
                campaign.revision || 1,


            /*
             * Une progression est créée
             * lorsqu'une campagne est commencée.
             */
            status:
                "in-progress",


            /*
             * Les scénarios terminés restent
             * enregistrés définitivement dans
             * cette progression.
             */
            completedScenarios: [],


            /*
             * Au démarrage, seul le premier
             * chapitre est disponible.
             */
            unlockedChapters: [

                campaign
                    .chapters[0]
                    .id

            ],


            createdAt:
                now,


            updatedAt:
                now,


            completedAt:
                null

        };

    }


    /*
     * ------------------------------------------------
     * SAUVEGARDE
     * ------------------------------------------------
     */

    function save(
        progress
    ) {

        if (
            !progress ||
            !progress.campaignId
        ) {

            throw new Error(
                "Impossible d'enregistrer une progression sans campaignId."
            );

        }


        const now =
            new Date()
                .toISOString();


        const normalized = {

            ...progress,

            saveSchemaVersion:
                SAVE_SCHEMA_VERSION,

            completedScenarios:
                Array.isArray(
                    progress.completedScenarios
                )
                    ? [
                        ...new Set(
                            progress.completedScenarios
                        )
                    ]
                    : [],

            unlockedChapters:
                Array.isArray(
                    progress.unlockedChapters
                )
                    ? [
                        ...new Set(
                            progress.unlockedChapters
                        )
                    ]
                    : [],

            createdAt:
                progress.createdAt ||
                now,

            updatedAt:
                now,

            completedAt:
                progress.completedAt ||
                null

        };


        localStorage.setItem(

            getSaveKey(
                normalized.campaignId
            ),

            JSON.stringify(
                normalized
            )

        );


        return normalized;

    }


    /*
     * ------------------------------------------------
     * CHARGEMENT
     * ------------------------------------------------
     */

    function load(
        campaignId
    ) {

        const raw =
            localStorage.getItem(
                getSaveKey(
                    campaignId
                )
            );


        if (!raw) {

            return null;

        }


        let progress;


        try {

            progress =
                JSON.parse(
                    raw
                );

        }

        catch (error) {

            throw new Error(
                "La sauvegarde de progression de campagne est illisible."
            );

        }


        if (
            progress.saveSchemaVersion !==
            SAVE_SCHEMA_VERSION
        ) {

            throw new Error(
                `Version de progression non supportée : ${progress.saveSchemaVersion}`
            );

        }


        if (
            progress.campaignId !==
            campaignId
        ) {

            throw new Error(
                "La progression ne correspond pas à la campagne demandée."
            );

        }


        return progress;

    }


    /*
     * ------------------------------------------------
     * CHARGER OU COMMENCER
     * ------------------------------------------------
     */

    function getOrCreate(
        campaign
    ) {

        const existing =
            load(
                campaign.id
            );


        if (existing) {

            return existing;

        }


        return save(
            create(
                campaign
            )
        );

    }

    /*
    * ------------------------------------------------
    * ÉTAT D'UN CHAPITRE
    * ------------------------------------------------
    */

    function isChapterComplete(
        chapter,
        progress
    ) {

        return chapter.scenarios
            .every(
                scenarioId =>
                    progress
                        .completedScenarios
                        .includes(
                            scenarioId
                        )
            );

    }


    /*
    * ------------------------------------------------
    * TERMINER UN SCÉNARIO
    * ------------------------------------------------
    */

    function completeScenario(
        campaign,
        scenarioId
    ) {

        /*
        * La campagne doit toujours être valide
        * avant de modifier sa progression.
        */

        const validation =
            CampaignSchema.validate(
                campaign
            );


        if (
            !validation.valid
        ) {

            throw new Error(
                "Impossible de mettre à jour une campagne invalide."
            );

        }


        /*
        * On cherche dans quel chapitre
        * se trouve le scénario.
        */

        const chapterIndex =
            campaign.chapters
                .findIndex(
                    chapter =>
                        chapter.scenarios
                            .includes(
                                scenarioId
                            )
                );


        if (
            chapterIndex === -1
        ) {

            throw new Error(
                `Le scénario ${scenarioId} n'appartient pas à cette campagne.`
            );

        }


        const chapter =
            campaign
                .chapters[
                    chapterIndex
                ];


        /*
        * On charge la progression existante
        * ou on en crée une si nécessaire.
        */

        const progress =
            getOrCreate(
                campaign
            );


        /*
        * Un scénario appartenant à un chapitre
        * encore verrouillé ne peut pas être terminé.
        */

        if (
            !progress
                .unlockedChapters
                .includes(
                    chapter.id
                )
        ) {

            throw new Error(
                "Ce chapitre est encore verrouillé."
            );

        }


        /*
        * ------------------------------------------------
        * SCÉNARIO TERMINÉ
        * ------------------------------------------------
        *
        * On utilise un Set pour empêcher
        * les doublons.
        */

        const completedScenarios =
            new Set(
                progress
                    .completedScenarios
            );


        completedScenarios.add(
            scenarioId
        );


        const updatedProgress = {

            ...progress,

            campaignRevision:
                campaign.revision || 1,

            completedScenarios:
                [
                    ...completedScenarios
                ]

        };


        /*
        * ------------------------------------------------
        * CHAPITRE TERMINÉ ?
        * ------------------------------------------------
        */

        const chapterCompleted =
            isChapterComplete(
                chapter,
                updatedProgress
            );


        if (
            chapterCompleted
        ) {

            const nextChapter =
                campaign
                    .chapters[
                        chapterIndex + 1
                    ];


            /*
            * Un chapitre suivant existe :
            * on le débloque.
            */

            if (nextChapter) {

                const unlockedChapters =
                    new Set(
                        updatedProgress
                            .unlockedChapters
                    );


                unlockedChapters.add(
                    nextChapter.id
                );


                updatedProgress
                    .unlockedChapters =
                    [
                        ...unlockedChapters
                    ];

            }


            /*
            * Aucun chapitre suivant :
            * nous venons de terminer
            * le dernier chapitre.
            */

            else {

                updatedProgress.status =
                    "completed";


                updatedProgress.completedAt =
                    updatedProgress.completedAt ||
                    new Date()
                        .toISOString();

            }

        }


        /*
        * La progression est sauvegardée
        * immédiatement.
        */

        return save(
            updatedProgress
        );

    }    

    /*
     * ------------------------------------------------
     * REMISE À ZÉRO
     * ------------------------------------------------
     *
     * Cette fonction sera utile plus tard pour
     * "Recommencer la campagne".
     */

    function reset(
        campaignId
    ) {

        localStorage.removeItem(
            getSaveKey(
                campaignId
            )
        );

    }


    return {

        SAVE_SCHEMA_VERSION,

        create,

        save,

        load,

        getOrCreate,

        isChapterComplete,

        completeScenario,

        reset

    };

})();