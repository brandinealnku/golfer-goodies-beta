# Location data handling

Location is requested only after **Find courses near me** is activated. Permissions status is progressive enhancement; manual search always remains available. The browser makes one `getCurrentPosition` request with a timeout and maximum age and never calls `watchPosition`.

Precise latitude, longitude, and accuracy exist only in memory for the current nearby request. They are not written to Firestore, localStorage, IndexedDB, profiles, analytics, application logs, or error reports, and are discarded when the request finishes. The server does not log request bodies. No continuous or background history is created. A coarse city label could be retained in a future phase only after privacy review and only when it cannot reconstruct precise location.

Permission denial, timeout, unavailable/unsupported APIs, poor accuracy, provider failure, and empty results retain manual search. Discovery location is not ordering eligibility.
