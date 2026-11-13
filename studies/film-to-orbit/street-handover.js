import {smooth} from './journey-state.js?v=street-plate-1';
// The plate survives the film fade and first pullback; it clears before titles arrive.
export const streetOpacity=arrival=>1-smooth(.14,.58,arrival);
// Stay a solid, dark silhouette during the film dissolve, avoiding doubled eyes.
export const streetExposure=arrival=>.035+1.165*smooth(0,.55,arrival);
