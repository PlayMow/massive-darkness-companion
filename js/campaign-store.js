window.CampaignStore = (() => {

    const INDEX_KEY =
        "MDC_CAMPAIGN_LIBRARY_V1";


    const CAMPAIGN_PREFIX =
        "MDC_CAMPAIGN_V1_";


    function getCampaignKey(
        campaignId
    ) {

        return (
            CAMPAIGN_PREFIX +
            campaignId
        );

    }


    function readIndex() {

        const raw =
            localStorage.getItem(
                INDEX_KEY
            );


        if (!raw) {

            return [];

        }


        try {

            const parsed =
                JSON.parse(
                    raw
                );


            return Array.isArray(parsed)
                ? parsed
                : [];

        }

        catch (error) {

            console.error(
                "Impossible de lire la bibliothèque de campagnes.",
                error
            );


            return [];

        }

    }


    function writeIndex(
        ids
    ) {

        localStorage.setItem(

            INDEX_KEY,

            JSON.stringify(
                [
                    ...new Set(
                        ids
                    )
                ]
            )

        );

    }


    function save(
        campaign
    ) {

        const migrated =
            CampaignSchema.migrate(
                campaign
            );


        const validation =
            CampaignSchema.validate(
                migrated
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "La campagne ne peut pas être enregistrée.\n\n" +

                validation.errors
                    .map(
                        error =>
                            `• ${error}`
                    )
                    .join("\n")

            );

        }


        localStorage.setItem(

            getCampaignKey(
                migrated.id
            ),

            JSON.stringify(
                migrated
            )

        );


        const index =
            readIndex();


        if (
            !index.includes(
                migrated.id
            )
        ) {

            index.push(
                migrated.id
            );


            writeIndex(
                index
            );

        }


        return migrated;

    }


    function get(
        campaignId
    ) {

        const raw =
            localStorage.getItem(
                getCampaignKey(
                    campaignId
                )
            );


        if (!raw) {

            return null;

        }


        try {

            return CampaignSchema.migrate(
                JSON.parse(
                    raw
                )
            );

        }

        catch (error) {

            console.error(
                `Impossible de charger la campagne ${campaignId}.`,
                error
            );


            return null;

        }

    }


    function getAll() {

        return readIndex()

            .map(
                id =>
                    get(id)
            )

            .filter(Boolean);

    }


    function remove(
        campaignId
    ) {

        localStorage.removeItem(
            getCampaignKey(
                campaignId
            )
        );


        writeIndex(

            readIndex()
                .filter(
                    id =>
                        id !==
                        campaignId
                )

        );

    }


    function has(
        campaignId
    ) {

        return Boolean(
            localStorage.getItem(
                getCampaignKey(
                    campaignId
                )
            )
        );

    }


    return {

        save,

        get,

        getAll,

        remove,

        has

    };

})();