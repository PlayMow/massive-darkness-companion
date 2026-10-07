window.ScenarioStore = (() => {

    const INDEX_KEY =
        "MDC_SCENARIO_LIBRARY_V1";


    const SCENARIO_PREFIX =
        "MDC_SCENARIO_V2_";


    function getScenarioKey(
        scenarioId
    ) {

        return (
            SCENARIO_PREFIX +
            scenarioId
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
                "Impossible de lire la bibliothèque de scénarios.",
                error
            );


            return [];

        }

    }


    function writeIndex(
        ids
    ) {

        const uniqueIds =
            [
                ...new Set(
                    ids
                )
            ];


        localStorage.setItem(

            INDEX_KEY,

            JSON.stringify(
                uniqueIds
            )

        );

    }


    function save(
        scenario
    ) {

        if (
            !scenario ||
            !scenario.id
        ) {

            throw new Error(
                "Impossible d'enregistrer un scénario sans identifiant."
            );

        }


        const migrated =
            ScenarioSchema.migrate(
                scenario
            );


        const validation =
            ScenarioSchema.validate(
                migrated
            );


        if (
            !validation.valid
        ) {

            throw new Error(

                "Le scénario ne peut pas être enregistré.\n\n" +

                validation.errors
                    .map(
                        error =>
                            `• ${error}`
                    )
                    .join("\n")

            );

        }


        localStorage.setItem(

            getScenarioKey(
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
        scenarioId
    ) {

        const raw =
            localStorage.getItem(
                getScenarioKey(
                    scenarioId
                )
            );


        if (!raw) {

            return null;

        }


        try {

            return ScenarioSchema.migrate(
                JSON.parse(
                    raw
                )
            );

        }

        catch (error) {

            console.error(
                `Impossible de charger le scénario ${scenarioId}.`,
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
        scenarioId
    ) {

        localStorage.removeItem(
            getScenarioKey(
                scenarioId
            )
        );


        writeIndex(

            readIndex()
                .filter(
                    id =>
                        id !==
                        scenarioId
                )

        );

    }


    function has(
        scenarioId
    ) {

        return Boolean(
            localStorage.getItem(
                getScenarioKey(
                    scenarioId
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