window.ScenarioCatalog = (() => {

    /*
     * ------------------------------------------------------------
     * SETS DE TUILES PHYSIQUES
     * ------------------------------------------------------------
     *
     * Un set correspond à une boîte / collection de tuiles.
     *
     * Il ne correspond PAS à un environnement visuel.
     *
     * Exemple :
     * Crystal & Lava = un seul set physique
     * mais deux environnements : crystal et lava.
     */


    const TILE_SETS = {

        hellscape: {

            id: "hellscape",

            label:
                "Massive Darkness 2 — Hellscape",

            module:
                "md2-hellscape",

            from: [
                "boxMd2CoreBox"
            ]

        },


        heavenfall: {

            id: "heavenfall",

            label:
                "Massive Darkness 2 — Heavenfall",

            module:
                "md2-heavenfall",

            from: [
                "boxMd2Heavenfall"
            ]

        },


        "rainbow-crossing": {

            id:
                "rainbow-crossing",

            label:
                "Massive Darkness 2 — Rainbow Crossing",

            module:
                "md2-rainbowcrossing",

            from: [
                "boxMd2RainbowCrossing"
            ]

        },


        "crystal-lava": {

            id:
                "crystal-lava",

            label:
                "A Quest of Crystal & Lava",

            module:
                "md2-crystallava-cl",

            from: [
                "boxMd2CrystalLava"
            ]

        },


        "massive-darkness-1": {

            id:
                "massive-darkness-1",

            label:
                "Massive Darkness 1",

            module:
                "md1-base",

            from: [
                "massiveDarkness1"
            ]

        }

    };


    /*
     * ------------------------------------------------------------
     * ORGANISATION DES ENVIRONNEMENTS
     * ------------------------------------------------------------
     */


    const MIX_MODES = {

        mixed: {

            id:
                "mixed",

            label:
                "Mélange libre",

            description:
                "Les environnements des sets sélectionnés peuvent être mélangés librement.",

            module:
                "maps-default-notuniform"

        },


        single: {

            id:
                "single",

            label:
                "Un seul environnement aléatoire",

            description:
                "Le générateur choisit un seul environnement compatible pour l'ensemble du donjon.",

            module:
                "maps-default-uniform"

        },


        split: {

            id:
                "split",

            label:
                "Zones distinctes",

            description:
                "Le donjon est séparé en zones utilisant des environnements différents.",

            module:
                "maps-default-split"

        }

    };


    /*
     * ------------------------------------------------------------
     * API PUBLIQUE
     * ------------------------------------------------------------
     */


    return {

        TILE_SETS,

        MIX_MODES

    };

})();