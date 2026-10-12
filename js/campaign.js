const CampaignHub = (() => {


    const PLAYTEST_KEY =
        "MDC_PLAYTEST_SCENARIO_V1";


    const CAMPAIGN_CONTEXT_KEY =
        "MDC_PLAYTEST_CAMPAIGN_CONTEXT_V1";

    let campaign = null;

    let progress = null;


    /*
     * ------------------------------------------------
     * CHARGEMENT DE LA CAMPAGNE
     * ------------------------------------------------
     */

    function loadCampaign() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const requestedCampaignId =
            params.get(
                "campaignId"
            );


        /*
         * Si un campaignId est présent dans l'URL,
         * il est prioritaire.
         *
         * Exemple :
         *
         * campaign.html?campaignId=campaign-123
         */

        if (
            requestedCampaignId
        ) {

            return CampaignStore.get(
                requestedCampaignId
            );

        }


        /*
         * Pour l'instant, si aucune campagne
         * n'est précisée, on utilise la première
         * campagne enregistrée.
         *
         * Plus tard, nous pourrons ajouter
         * un véritable écran de sélection.
         */

        const campaigns =
            CampaignStore.getAll();


        return campaigns[0] || null;

    }


    /*
     * ------------------------------------------------
     * INFORMATIONS GÉNÉRALES
     * ------------------------------------------------
     */

    function renderOverview() {

        document
            .getElementById(
                "campaign-title"
            )
            .textContent =
            campaign.title;


        document
            .getElementById(
                "campaign-description"
            )
            .textContent =
            campaign.description || "";


        /*
         * STATUT GLOBAL
         */

        const status =
            document
                .getElementById(
                    "campaign-status"
                );


        const completed =
            progress.status ===
            "completed";


        status.textContent =
            completed
                ? "Campagne terminée"
                : "Campagne en cours";


        status.classList.toggle(
            "is-completed",
            completed
        );


        /*
         * MÉTADONNÉES
         */

        const meta =
            document
                .getElementById(
                    "campaign-meta"
                );


        meta.innerHTML =
            "";


        const scenarioCount =
            campaign.chapters
                .reduce(
                    (
                        total,
                        chapter
                    ) =>
                        total +
                        chapter.scenarios.length,
                    0
                );


        const completedCount =
            progress
                .completedScenarios
                .length;


        const values = [

            `${campaign.chapters.length} chapitre(s)`,

            `${scenarioCount} scénario(s)`,

            `${completedCount} / ${scenarioCount} terminé(s)`

        ];


        values.forEach(
            value => {

                const chip =
                    document
                        .createElement(
                            "span"
                        );


                chip.textContent =
                    value;


                meta.appendChild(
                    chip
                );

            }
        );

    }

    /*
     * ------------------------------------------------
     * LANCER UN SCÉNARIO
     * ------------------------------------------------
     */

    function playScenario(
        chapter,
        chapterIndex,
        scenarioId
    ) {

        /*
         * Sécurité :
         * le chapitre doit être débloqué.
         */

        const unlocked =
            progress
                .unlockedChapters
                .includes(
                    chapter.id
                );


        if (!unlocked) {

            return;

        }


        /*
         * Récupération du scénario
         * depuis la bibliothèque.
         */

        const storedScenario =
            ScenarioStore.get(
                scenarioId
            );


        if (!storedScenario) {

            window.alert(
                "Impossible de charger ce scénario."
            );


            return;

        }


        /*
         * On crée une copie destinée
         * uniquement au Playtest.
         *
         * Cela permet d'injecter les vraies
         * informations de campagne sans
         * modifier ScenarioStore.
         */

        const playtestScenario = {

            ...storedScenario,

            campaign: {

                id:
                    campaign.id,

                title:
                    campaign.title,

                chapter:
                    chapterIndex + 1

            }

        };


        /*
         * Scénario transmis au Playtest.
         */

        sessionStorage.setItem(

            PLAYTEST_KEY,

            JSON.stringify(
                playtestScenario
            )

        );


        /*
         * Contexte de campagne.
         *
         * Il sera exploité au Checkpoint H
         * lorsque la quête sera terminée.
         */

        const campaignContext = {

            campaignId:
                campaign.id,

            campaignRevision:
                campaign.revision || 1,

            chapterId:
                chapter.id,

            chapterIndex:
                chapterIndex,

            scenarioId:
                scenarioId

        };


        sessionStorage.setItem(

            CAMPAIGN_CONTEXT_KEY,

            JSON.stringify(
                campaignContext
            )

        );


        /*
         * Ouverture du Playtest.
         */

        window.location.href =
            "scenario-playtest.html";

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
                    "campaign-chapters"
                );


        container.innerHTML =
            "";


        campaign.chapters
            .forEach(
                (
                    chapter,
                    chapterIndex
                ) => {

                    const unlocked =
                        progress
                            .unlockedChapters
                            .includes(
                                chapter.id
                            );


                    const completed =
                        CampaignProgress
                            .isChapterComplete(
                                chapter,
                                progress
                            );


                    /*
                     * CARTE DU CHAPITRE
                     */

                    const card =
                        document
                            .createElement(
                                "article"
                            );


                    card.className =
                        "campaign-chapter";


                    card.classList.toggle(
                        "is-unlocked",
                        unlocked
                    );


                    card.classList.toggle(
                        "is-locked",
                        !unlocked
                    );


                    card.classList.toggle(
                        "is-completed",
                        completed
                    );


                    /*
                     * HEADER
                     */

                    const header =
                        document
                            .createElement(
                                "div"
                            );


                    header.className =
                        "campaign-chapter__header";


                    const heading =
                        document
                            .createElement(
                                "div"
                            );


                    const number =
                        document
                            .createElement(
                                "span"
                            );


                    number.className =
                        "campaign-chapter__number";


                    number.textContent =
                        `Chapitre ${chapterIndex + 1}`;


                    const title =
                        document
                            .createElement(
                                "h3"
                            );


                    title.textContent =
                        chapter.title;


                    heading.appendChild(
                        number
                    );


                    heading.appendChild(
                        title
                    );


                    /*
                     * BADGE DE STATUT
                     */

                    const chapterStatus =
                        document
                            .createElement(
                                "span"
                            );


                    chapterStatus.className =
                        "campaign-chapter__status";


                    if (
                        completed
                    ) {

                        chapterStatus.textContent =
                            "Terminé";


                        chapterStatus.classList.add(
                            "is-completed"
                        );

                    }

                    else if (
                        unlocked
                    ) {

                        chapterStatus.textContent =
                            "Disponible";


                        chapterStatus.classList.add(
                            "is-available"
                        );

                    }

                    else {

                        chapterStatus.textContent =
                            "Verrouillé";


                        chapterStatus.classList.add(
                            "is-locked"
                        );

                    }


                    header.appendChild(
                        heading
                    );


                    header.appendChild(
                        chapterStatus
                    );


                    card.appendChild(
                        header
                    );


                    /*
                     * SCÉNARIOS DU CHAPITRE
                     */

                    const scenarios =
                        document
                            .createElement(
                                "div"
                            );


                    scenarios.className =
                        "campaign-scenarios";


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


                                const scenarioCompleted =
                                    progress
                                        .completedScenarios
                                        .includes(
                                            scenarioId
                                        );


                                const row =
                                    document
                                        .createElement(
                                            "div"
                                        );


                                row.className =
                                    "campaign-scenario";


                                row.classList.toggle(
                                    "is-completed",
                                    scenarioCompleted
                                );


                                row.classList.toggle(
                                    "is-locked",
                                    !unlocked
                                );


                                /*
                                 * ORDRE
                                 */

                                const order =
                                    document
                                        .createElement(
                                            "span"
                                        );


                                order.className =
                                    "campaign-scenario__order";


                                order.textContent =
                                    String(
                                        scenarioIndex + 1
                                    );


                                /*
                                 * TITRE
                                 */

                                const info =
                                    document
                                        .createElement(
                                            "div"
                                        );


                                info.className =
                                    "campaign-scenario__info";


                                const scenarioTitle =
                                    document
                                        .createElement(
                                            "strong"
                                        );


                                scenarioTitle.textContent =
                                    scenario?.title ||
                                    "Scénario introuvable";


                                const state =
                                    document
                                        .createElement(
                                            "small"
                                        );


                                if (
                                    scenarioCompleted
                                ) {

                                    state.textContent =
                                        "Terminé";

                                }

                                else if (
                                    unlocked
                                ) {

                                    state.textContent =
                                        "À jouer";

                                }

                                else {

                                    state.textContent =
                                        "Chapitre verrouillé";

                                }


                                info.appendChild(
                                    scenarioTitle
                                );


                                info.appendChild(
                                    state
                                );


                                row.appendChild(
                                    order
                                );


                                row.appendChild(
                                    info
                                );


                                /*
                                * ACTION DU SCÉNARIO
                                */

                                if (
                                    unlocked &&
                                    scenario
                                ) {

                                    const actions =
                                        document
                                            .createElement(
                                                "div"
                                            );


                                    actions.className =
                                        "campaign-scenario__actions";


                                    const playButton =
                                        document
                                            .createElement(
                                                "button"
                                            );


                                    playButton.type =
                                        "button";


                                    playButton.className =
                                        "primary-button";


                                    playButton.textContent =
                                        scenarioCompleted
                                            ? "Rejouer"
                                            : "Jouer";


                                    playButton.addEventListener(
                                        "click",
                                        () => {

                                            playScenario(
                                                chapter,
                                                chapterIndex,
                                                scenarioId
                                            );

                                        }
                                    );


                                    actions.appendChild(
                                        playButton
                                    );


                                    row.appendChild(
                                        actions
                                    );

                                }


                                scenarios.appendChild(
                                    row
                                );

                            }
                        );


                    card.appendChild(
                        scenarios
                    );


                    container.appendChild(
                        card
                    );

                }
            );

    }


    /*
     * ------------------------------------------------
     * ERREUR
     * ------------------------------------------------
     */

    function showError(
        message
    ) {

        document
            .getElementById(
                "campaign-overview"
            )
            .hidden =
            true;


        document
            .getElementById(
                "chapters-panel"
            )
            .hidden =
            true;


        document
            .getElementById(
                "campaign-error"
            )
            .hidden =
            false;


        document
            .getElementById(
                "campaign-error-message"
            )
            .textContent =
            message;

    }


    /*
     * ------------------------------------------------
     * INITIALISATION
     * ------------------------------------------------
     */

    function initialize() {

        try {

            campaign =
                loadCampaign();


            if (
                !campaign
            ) {

                showError(
                    "Aucune campagne valide n'est enregistrée. Créez et enregistrez d'abord une campagne dans le Campaign Editor."
                );


                return;

            }


            /*
             * Une première ouverture crée
             * automatiquement la progression.
             *
             * Seul le chapitre 1 sera alors
             * déverrouillé.
             */
            progress =
                CampaignProgress
                    .getOrCreate(
                        campaign
                    );


            renderOverview();

            renderChapters();

        }

        catch (error) {

            console.error(
                error
            );


            showError(
                error.message ||
                String(
                    error
                )
            );

        }

    }


    return {

        initialize

    };

})();


document.addEventListener(

    "DOMContentLoaded",

    CampaignHub.initialize

);