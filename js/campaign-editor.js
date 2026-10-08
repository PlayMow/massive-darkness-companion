const CampaignEditor = (() => {

    const DRAFT_KEY =
        "MDC_CAMPAIGN_DRAFT_V1";


    let campaign;


    /*
     * ------------------------------------------------
     * LECTURE DE L'INTERFACE
     * ------------------------------------------------
     */

    function readCampaign() {

        return {

            ...campaign,

            schemaVersion:
                CampaignSchema
                    .CURRENT_VERSION,

            title:
                document
                    .getElementById(
                        "campaign-title"
                    )
                    .value
                    .trim(),

            description:
                document
                    .getElementById(
                        "campaign-description"
                    )
                    .value
                    .trim()

        };

    }


    /*
     * ------------------------------------------------
     * ÉCRITURE DANS L'INTERFACE
     * ------------------------------------------------
     */

    function writeCampaign(
        value
    ) {

        campaign =
            CampaignSchema.migrate(
                value
            );


        document
            .getElementById(
                "campaign-title"
            )
            .value =
            campaign.title || "";


        document
            .getElementById(
                "campaign-description"
            )
            .value =
            campaign.description || "";


        renderPreview();

    }


    /*
     * ------------------------------------------------
     * APERÇU JSON
     * ------------------------------------------------
     */

    function renderPreview() {

        campaign =
            readCampaign();


        document
            .getElementById(
                "json-preview"
            )
            .textContent =
            JSON.stringify(
                campaign,
                null,
                2
            );

    }


    /*
     * ------------------------------------------------
     * STATUT
     * ------------------------------------------------
     */

    function setStatus(
        message
    ) {

        const status =
            document
                .getElementById(
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

                    status.textContent =
                        "";

                },
                2500
            );

    }


    /*
     * ------------------------------------------------
     * SAUVEGARDE DU BROUILLON
     * ------------------------------------------------
     */

    function saveDraft() {

        campaign =
            readCampaign();


        localStorage.setItem(

            DRAFT_KEY,

            JSON.stringify(
                campaign
            )

        );


        /*
         * Pour l'instant une campagne nouvellement
         * créée n'a encore aucun scénario assigné.
         *
         * Elle peut donc être un brouillon valide
         * pour l'éditeur sans être encore publiable
         * dans CampaignStore.
         */

        const validation =
            CampaignSchema.validate(
                campaign
            );


        if (
            validation.valid
        ) {

            CampaignStore.save(
                campaign
            );


            setStatus(
                "Brouillon et campagne enregistrés."
            );


            return;

        }


        setStatus(
            "Brouillon enregistré."
        );

    }


    /*
     * ------------------------------------------------
     * CHARGEMENT
     * ------------------------------------------------
     */

    function loadDraft() {

        const raw =
            localStorage.getItem(
                DRAFT_KEY
            );


        if (!raw) {

            return false;

        }


        try {

            writeCampaign(
                JSON.parse(
                    raw
                )
            );


            setStatus(
                "Brouillon local chargé."
            );


            return true;

        }

        catch (error) {

            console.error(
                "Impossible de charger le brouillon de campagne.",
                error
            );


            return false;

        }

    }


    /*
     * ------------------------------------------------
     * INITIALISATION
     * ------------------------------------------------
     */

    function initialize() {

        if (
            !loadDraft()
        ) {

            writeCampaign(
                CampaignSchema
                    .createCampaign()
            );

        }


        document
            .getElementById(
                "save-draft"
            )
            .addEventListener(
                "click",
                saveDraft
            );


        document
            .querySelectorAll(
                "#campaign-form input, " +
                "#campaign-form textarea"
            )
            .forEach(
                control => {

                    control
                        .addEventListener(
                            "input",
                            renderPreview
                        );

                    control
                        .addEventListener(
                            "change",
                            renderPreview
                        );

                }
            );

    }


    return {

        initialize

    };

})();


document.addEventListener(

    "DOMContentLoaded",

    CampaignEditor.initialize

);