import { IGunChainReference } from '../chain';

export interface IGunStaticNode {

    /** Returns true if data is a gun node, otherwise false. */
    is(anything: any): anything is IGunChainReference;

    /**
     * Returns data's gun ID (instead of manually grabbing its metadata i.e. data["_"]["#"], which is faster but could change in the future)
     *
     * Returns undefined if data is not correct gun data.
     */
    soul(data: IGunChainReference): string;

    /** Returns a "gun-ified" variant of the json input by injecting a new gun ID into the metadata field. */
    ify(json: any): any;
}
