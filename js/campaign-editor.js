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

    function getAssignedScenarioIds() {

        return new Set(

            campaign.chapters
                .flatMap(
                    chapter =>
                        chapter.scenarios || []
                )

        );

    }

    function renderChapters() {

        const container =
            document
                .getElementById(
                    "chapters-list"
                );


        container.innerHTML =
            "";


        /*
        * Tous les scénarios disponibles
        * dans notre bibliothèque.
        */
        const libraryScenarios =
            ScenarioStore.getAll();


        campaign.chapters
            .forEach(
                (
                    chapter,
                    index
                ) => {

                    /*
                    * Sécurité pour d'anciens
                    * brouillons éventuels.
                    */
                    if (
                        !Array.isArray(
                            chapter.scenarios
                        )
                    ) {

                        chapter.scenarios =
                            [];

                    }


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
                    * ================================================
                    * HEADER
                    * ================================================
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
                    * ACTIONS DU CHAPITRE
                    */

                    const actions =
                        document
                            .createElement(
                                "div"
                            );


                    actions.className =
                        "chapter-card__actions";


                    /*
                    * MONTER LE CHAPITRE
                    */

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


                    /*
                    * DESCENDRE LE CHAPITRE
                    */

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


                    /*
                    * SUPPRIMER LE CHAPITRE
                    */

                    const removeChapter =
                        document
                            .createElement(
                                "button"
                            );


                    removeChapter.type =
                        "button";


                    removeChapter.className =
                        "danger-button";


                    removeChapter.textContent =
                        "Supprimer";


                    removeChapter.disabled =
                        campaign
                            .chapters
                            .length === 1;


                    removeChapter.addEventListener(
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

                                    `Supprimer le chapitre « ${
                                        chapter.title ||
                                        `Chapitre ${index + 1}`
                                    } » ?\n\n` +

                                    "Les scénarios qu'il contient seront retirés de ce chapitre mais resteront disponibles dans la bibliothèque."

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
                        removeChapter
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
                    * ================================================
                    * SCÉNARIOS DU CHAPITRE
                    * ================================================
                    */

                    const scenariosSection =
                        document
                            .createElement(
                                "div"
                            );


                    scenariosSection.className =
                        "chapter-scenarios";


                    const scenariosTitle =
                        document
                            .createElement(
                                "div"
                            );


                    scenariosTitle.className =
                        "chapter-scenarios__title";


                    scenariosTitle.textContent =
                        "Scénarios du chapitre";


                    scenariosSection.appendChild(
                        scenariosTitle
                    );


                    /*
                    * LISTE DES SCÉNARIOS ACTUELS
                    */

                    const scenarioList =
                        document
                            .createElement(
                                "div"
                            );


                    scenarioList.className =
                        "chapter-scenarios__list";


                    if (
                        chapter.scenarios.length === 0
                    ) {

                        const empty =
                            document
                                .createElement(
                                    "div"
                                );


                        empty.className =
                            "chapter-card__empty";


                        empty.textContent =
                            "Aucun scénario assigné pour le moment.";


                        scenarioList.appendChild(
                            empty
                        );

                    }

                    else {

                        chapter.scenarios
                            .forEach(
                                (
                                    scenarioId,
                                    scenarioIndex
                                ) => {

                                    const scenario =
                                        ScenarioStore.get(
                                            scenarioId
                                        );


                                    const row =
                                        document
                                            .createElement(
                                                "div"
                                            );


                                    row.className =
                                        "chapter-scenario";


                                    /*
                                    * ================================================
                                    * INFORMATIONS
                                    * ================================================
                                    */

                                    const info =
                                        document
                                            .createElement(
                                                "div"
                                            );


                                    info.className =
                                        "chapter-scenario__info";


                                    const scenarioTitle =
                                        document
                                            .createElement(
                                                "strong"
                                            );


                                    scenarioTitle.textContent =
                                        scenario
                                            ?.title
                                        ||
                                        "Scénario introuvable";


                                    const scenarioIdText =
                                        document
                                            .createElement(
                                                "small"
                                            );


                                    scenarioIdText.textContent =
                                        scenarioId;


                                    info.appendChild(
                                        scenarioTitle
                                    );


                                    info.appendChild(
                                        scenarioIdText
                                    );


                                    /*
                                    * ================================================
                                    * ACTIONS
                                    * ================================================
                                    */

                                    const scenarioActions =
                                        document
                                            .createElement(
                                                "div"
                                            );


                                    scenarioActions.className =
                                        "chapter-scenario__actions";


                                    /*
                                    * MONTER
                                    */

                                    const moveScenarioUp =
                                        document
                                            .createElement(
                                                "button"
                                            );


                                    moveScenarioUp.type =
                                        "button";


                                    moveScenarioUp.className =
                                        "secondary-button";


                                    moveScenarioUp.textContent =
                                        "↑";


                                    moveScenarioUp.title =
                                        "Monter le scénario";


                                    moveScenarioUp.disabled =
                                        scenarioIndex === 0;


                                    moveScenarioUp.addEventListener(
                                        "click",
                                        () => {

                                            if (
                                                scenarioIndex === 0
                                            ) {

                                                return;

                                            }


                                            [
                                                chapter.scenarios[
                                                    scenarioIndex - 1
                                                ],
                                                chapter.scenarios[
                                                    scenarioIndex
                                                ]
                                            ] = [

                                                chapter.scenarios[
                                                    scenarioIndex
                                                ],

                                                chapter.scenarios[
                                                    scenarioIndex - 1
                                                ]

                                            ];


                                            renderChapters();

                                            renderPreview();

                                        }
                                    );


                                    /*
                                    * DESCENDRE
                                    */

                                    const moveScenarioDown =
                                        document
                                            .createElement(
                                                "button"
                                            );


                                    moveScenarioDown.type =
                                        "button";


                                    moveScenarioDown.className =
                                        "secondary-button";


                                    moveScenarioDown.textContent =
                                        "↓";


                                    moveScenarioDown.title =
                                        "Descendre le scénario";


                                    moveScenarioDown.disabled =
                                        scenarioIndex ===
                                        chapter.scenarios.length - 1;


                                    moveScenarioDown.addEventListener(
                                        "click",
                                        () => {

                                            if (
                                                scenarioIndex ===
                                                chapter.scenarios.length - 1
                                            ) {

                                                return;

                                            }


                                            [
                                                chapter.scenarios[
                                                    scenarioIndex
                                                ],
                                                chapter.scenarios[
                                                    scenarioIndex + 1
                                                ]
                                            ] = [

                                                chapter.scenarios[
                                                    scenarioIndex + 1
                                                ],

                                                chapter.scenarios[
                                                    scenarioIndex
                                                ]

                                            ];


                                            renderChapters();

                                            renderPreview();

                                        }
                                    );


                                    /*
                                    * RETIRER
                                    */

                                    const removeScenario =
                                        document
                                            .createElement(
                                                "button"
                                            );


                                    removeScenario.type =
                                        "button";


                                    removeScenario.className =
                                        "danger-button";


                                    removeScenario.textContent =
                                        "Retirer";


                                    removeScenario.addEventListener(
                                        "click",
                                        () => {

                                            chapter.scenarios =
                                                chapter.scenarios
                                                    .filter(
                                                        id =>
                                                            id !==
                                                            scenarioId
                                                    );


                                            /*
                                            * Le scénario retiré
                                            * redevient immédiatement
                                            * disponible dans les menus.
                                            */
                                            renderChapters();

                                            renderPreview();

                                        }
                                    );


                                    scenarioActions.appendChild(
                                        moveScenarioUp
                                    );


                                    scenarioActions.appendChild(
                                        moveScenarioDown
                                    );


                                    scenarioActions.appendChild(
                                        removeScenario
                                    );


                                    /*
                                    * ================================================
                                    * LIGNE
                                    * ================================================
                                    */

                                    row.appendChild(
                                        info
                                    );


                                    row.appendChild(
                                        scenarioActions
                                    );


                                    scenarioList.appendChild(
                                        row
                                    );

                                }
                            );

                    }


                    scenariosSection.appendChild(
                        scenarioList
                    );


                    /*
                    * ================================================
                    * AJOUTER UN SCÉNARIO
                    * ================================================
                    */

                    const addArea =
                        document
                            .createElement(
                                "div"
                            );


                    addArea.className =
                        "chapter-scenario-add";


                    const select =
                        document
                            .createElement(
                                "select"
                            );


                    const placeholder =
                        document
                            .createElement(
                                "option"
                            );


                    placeholder.value =
                        "";


                    placeholder.textContent =
                        "Sélectionner un scénario...";


                    select.appendChild(
                        placeholder
                    );


                    /*
                    * Tous les scénarios déjà utilisés
                    * dans n'importe quel chapitre.
                    */
                    const assignedScenarioIds =
                        getAssignedScenarioIds();


                    const availableScenarios =
                        libraryScenarios
                            .filter(
                                scenario =>
                                    !assignedScenarioIds
                                        .has(
                                            scenario.id
                                        )
                            );


                    availableScenarios
                        .forEach(
                            scenario => {

                                const option =
                                    document
                                        .createElement(
                                            "option"
                                        );


                                option.value =
                                    scenario.id;


                                option.textContent =
                                    scenario.title;


                                select.appendChild(
                                    option
                                );

                            }
                        );


                    const addButton =
                        document
                            .createElement(
                                "button"
                            );


                    addButton.type =
                        "button";


                    addButton.className =
                        "primary-button";


                    addButton.textContent =
                        "+ Ajouter";


                    /*
                    * Aucun scénario disponible :
                    * inutile de laisser les contrôles
                    * actifs.
                    */

                    if (
                        availableScenarios.length === 0
                    ) {

                        select.disabled =
                            true;


                        placeholder.textContent =
                            libraryScenarios.length === 0
                                ? "Aucun scénario dans la bibliothèque"
                                : "Tous les scénarios sont déjà assignés";


                        addButton.disabled =
                            true;

                    }


                    addButton.addEventListener(
                        "click",
                        () => {

                            const scenarioId =
                                select.value;


                            if (!scenarioId) {

                                return;

                            }


                            /*
                            * Deuxième sécurité anti-doublon.
                            *
                            * Même si l'interface devenait
                            * obsolète, on vérifie à nouveau
                            * les données avant l'ajout.
                            */
                            const alreadyAssigned =
                                campaign.chapters
                                    .some(
                                        currentChapter =>
                                            currentChapter
                                                .scenarios
                                                .includes(
                                                    scenarioId
                                                )
                                    );


                            if (
                                alreadyAssigned
                            ) {

                                window.alert(
                                    "Ce scénario est déjà utilisé dans cette campagne."
                                );


                                renderChapters();

                                return;

                            }


                            chapter.scenarios
                                .push(
                                    scenarioId
                                );


                            /*
                            * Tous les menus doivent être
                            * recalculés puisque ce scénario
                            * n'est désormais plus disponible.
                            */
                            renderChapters();

                            renderPreview();

                        }
                    );


                    addArea.appendChild(
                        select
                    );


                    addArea.appendChild(
                        addButton
                    );


                    scenariosSection.appendChild(
                        addArea
                    );


                    card.appendChild(
                        scenariosSection
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