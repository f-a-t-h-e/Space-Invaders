export class Attackable {
    health = 0
    constructor() {}
    /**
     * 
     * @param {number} damage 
     */
    hit(damage) {
        this.health -= damage;
        // if (this.health < 1 ) {
            if (this.health < 0) {
                this.health = 0;
            }
        //     this.destroy();
        // }
    }
    // destroy() {}
}

export function doNothing(..._args) {
    
}