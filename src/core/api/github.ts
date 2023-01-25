// GitHub API v3

import { configuration, type Configuration } from "$core/configuration/state";
import { FetchError } from "$core/model/fetch.error";
import { Optional } from "$core/model/optional";
import { Result } from "$core/model/result";
import { get } from "svelte/store";

const baseURL = 'https://api.github.com';
let config: Optional<Configuration> = Optional.empty();

export async function getContent(user: string, repository: string): Promise<Result<any, FetchError>> {
    const response = await gitFetch(`${baseURL}/repos/${user}/${repository}/contents/`, {
        cache: "no-store",
    });
    return response.map(response => response.json());
}

export async function getBlob(url: string): Promise<Result<any, FetchError>> {
    return (await gitFetch(url)).map(response => response.json());
}

async function gitFetch(url: RequestInfo, options?: RequestInit): Promise<Result<Response, FetchError>> {
    if (!config.isPresent()) {
        setToken()
    }
    const updatedOptions = { ...options };
    updatedOptions.headers = {
        ...updatedOptions.headers,
        Authorization: `Bearer ${config.get().github.accessToken}`,
    }
    const response = await fetch(url, updatedOptions)
    if (!response.ok) {
        return Result.err(FetchError.from(response));
    }
    return Result.ok(response);
}

function setToken() {
    // Acceptable because the properties are extremely static
    config = Optional.of(get(configuration))
    console.log('conf:');
    console.log(config)
    if (config.get() == null) {
        throw new Error("Cannot contact GitHub API without configuration");
    }
}