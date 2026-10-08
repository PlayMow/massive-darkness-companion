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

        reset

    };

})();