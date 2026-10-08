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


        renderChapters();

        renderPreview();

    }


    /*
    * ------------------------------------------------
    * CHAPITRES
    * ------------------------------------------------
    */

    function renderChapters() {

        const container =
            document
                .getElementById(
                    "chapters-list"
                );


        container.innerHTML =
            "";


        campaign.chapters
            .forEach(
                (
                    chapter,
                    index
                ) => {

                    const card =
                        document
                            .createElement(
                                "article"
                            );


                    card.className =
                        "chapter-card";


                    card.dataset.chapterId =
                        chapter.id;


                    /*
                    * HEADER
                    */

                    const header =
                        document
                            .createElement(
                                "div"
                            );


                    header.className =
                        "chapter-card__header";


                    /*
                    * TITRE
                    */

                    const titleArea =
                        document
                            .createElement(
                                "div"
                            );


                    titleArea.className =
                        "chapter-card__title";


                    const number =
                        document
                            .createElement(
                                "span"
                            );


                    number.className =
                        "chapter-card__number";


                    number.textContent =
                        `Chapitre ${index + 1}`;


                    const titleInput =
                        document
                            .createElement(
                                "input"
                            );


                    titleInput.type =
                        "text";


                    titleInput.value =
                        chapter.title || "";


                    titleInput.placeholder =
                        `Titre du chapitre ${index + 1}`;


                    titleInput.addEventListener(
                        "input",
                        () => {

                            chapter.title =
                                titleInput
                                    .value
                                    .trim();


                            renderPreview();

                        }
                    );


                    titleArea.appendChild(
                        number
                    );


                    titleArea.appendChild(
                        titleInput
                    );


                    /*
                    * ACTIONS
                    */

                    const actions =
                        document
                            .createElement(
                                "div"
                            );


                    actions.className =
                        "chapter-card__actions";


                    const moveUp =
                        document
                            .createElement(
                                "button"
                            );


                    moveUp.type =
                        "button";


                    moveUp.className =
                        "secondary-button";


                    moveUp.textContent =
                        "↑";


                    moveUp.title =
                        "Monter le chapitre";


                    moveUp.disabled =
                        index === 0;


                    moveUp.addEventListener(
                        "click",
                        () => {

                            if (
                                index === 0
                            ) {

                                return;

                            }


                            [
                                campaign.chapters[
                                    index - 1
                                ],
                                campaign.chapters[
                                    index
                                ]
                            ] = [

                                campaign.chapters[
                                    index
                                ],

                                campaign.chapters[
                                    index - 1
                                ]

                            ];


                            renderChapters();

                            renderPreview();

                        }
                    );


                    const moveDown =
                        document
                            .createElement(
                                "button"
                            );


                    moveDown.type =
                        "button";


                    moveDown.className =
                        "secondary-button";


                    moveDown.textContent =
                        "↓";


                    moveDown.title =
                        "Descendre le chapitre";


                    moveDown.disabled =
                        index ===
                        campaign.chapters.length - 1;


                    moveDown.addEventListener(
                        "click",
                        () => {

                            if (
                                index ===
                                campaign.chapters.length - 1
                            ) {

                                return;

                            }


                            [
                                campaign.chapters[
                                    index
                                ],
                                campaign.chapters[
                                    index + 1
                                ]
                            ] = [

                                campaign.chapters[
                                    index + 1
                                ],

                                campaign.chapters[
                                    index
                                ]

                            ];


                            renderChapters();

                            renderPreview();

                        }
                    );


                    const remove =
                        document
                            .createElement(
                                "button"
                            );


                    remove.type =
                        "button";


                    remove.className =
                        "danger-button";


                    remove.textContent =
                        "Supprimer";


                    /*
                    * Une campagne doit toujours
                    * conserver au moins un chapitre.
                    */

                    remove.disabled =
                        campaign
                            .chapters
                            .length === 1;


                    remove.addEventListener(
                        "click",
                        () => {

                            if (
                                campaign
                                    .chapters
                                    .length === 1
                            ) {

                                return;

                            }


                            const confirmed =
                                window.confirm(
                                    `Supprimer le chapitre « ${chapter.title || `Chapitre ${index + 1}`} » ?`
                                );


                            if (
                                !confirmed
                            ) {

                                return;

                            }


                            campaign.chapters
                                .splice(
                                    index,
                                    1
                                );


                            renderChapters();

                            renderPreview();

                        }
                    );


                    actions.appendChild(
                        moveUp
                    );


                    actions.appendChild(
                        moveDown
                    );


                    actions.appendChild(
                        remove
                    );


                    header.appendChild(
                        titleArea
                    );


                    header.appendChild(
                        actions
                    );


                    card.appendChild(
                        header
                    );


                    /*
                    * SCÉNARIOS
                    *
                    * La gestion réelle arrive
                    * en F2.
                    */

                    const empty =
                        document
                            .createElement(
                                "div"
                            );


                    empty.className =
                        "chapter-card__empty";


                    const scenarioCount =
                        chapter
                            .scenarios
                            ?.length
                        || 0;


                    empty.textContent =
                        scenarioCount
                            ? `${scenarioCount} scénario(s) assigné(s)`
                            : "Aucun scénario assigné pour le moment.";


                    card.appendChild(
                        empty
                    );


                    container.appendChild(
                        card
                    );

                }
            );

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
            .getElementById(
                "add-chapter"
            )
            .addEventListener(
                "click",
                () => {

                    const chapter =
                        CampaignSchema
                            .createChapter(
                                `Chapitre ${campaign.chapters.length + 1}`
                            );


                    campaign.chapters
                        .push(
                            chapter
                        );


                    renderChapters();

                    renderPreview();

                }
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