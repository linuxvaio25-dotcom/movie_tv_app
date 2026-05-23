import { Client, Databases, ID, Query } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

const client = new Client()
    // .setEndpoint('https://cloud.appwrite.io/v1')
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

const databases = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    // console.log(PROJECT_ID, DATABASE_ID, USERS_COLLECTION_ID);
    //1. use appwrite sdk to check if the search term exits in the database
    try {
        const result = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ])

        //2. if it does, update the count
        if (result.documents.length > 0) {
            const document = result.documents[0];

            await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, document.$id, {
                count: document.count + 1
            })
            
            //3. if it doesn't, create a new record with count 1
        } else {
            await databases.createDocument(DATABASE_ID, USERS_COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            })
        }
    } catch (error) {
        console.error('Error fetching search count:', error);
    }

    
}

export const getTrendingMovies = async () => {
    try {
const result = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [
    Query.limit(5),
    Query.orderDesc('count')
])

return result.documents;
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
}