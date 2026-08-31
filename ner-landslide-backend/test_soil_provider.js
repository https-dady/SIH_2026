// const SoilProvider = require(
//     "./src/services/dataSources/soil/soilProvider"
// );


// const testSoilProvider = async () => {
//     try {
//         const soilProvider =
//             new SoilProvider();

//         const result =
//             await soilProvider.getData(
//                 26.1445,
//                 91.7362
//             );

//         console.log("Soil Data:");
//         console.log(result);

//     } catch (error) {
//         console.error("Test Failed:");
//         console.error(error.message);
//     }
// };


// testSoilProvider();




const SoilProvider = require(
    "./src/services/dataSources/soil/soilProvider"
);


const testSoilProvider = async () => {
    try {
        const soilProvider =
            new SoilProvider();

        const result =
            await soilProvider.getData(
                26.1445,
                91.7362,
                42.75
            );

        console.log("Soil Data:");
        console.log(result);

    } catch (error) {
        console.error("Test Failed:");
        console.error(error.message);
    }
};


testSoilProvider();