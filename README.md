# sasaxios

`sasaxios` is a wrapper for [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/fetch), but provides an axios-like interface.

**This package is not production-ready so that should be used with caution.**

# Install

```bash
$ npm install sasaxios
```

or

```
$ yarn add sasaxios
```

# Usage

```typescript
import sasaxios from "sasaxios";

const axios = sasaxios.create({
  baseURL: "https://pokeapi.co/api/v2",
  withCredentials: false,
});

// request to https://pokeapi.co/api/v2/pokemon?limit=5&offset=10
axios.get("pokemon", { params: { limit: 5, offset: 10 } }).then((response) => {
  console.log(response.data.results[0].name); // metapod
});
```
