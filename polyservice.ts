import { service } from "./service";
import { middleware } from "./middleware";
import { HttpListener } from "./server";
import {controller, instanceOfController} from "./controller";

/**
 * @private
 */
interface polyservice{
	register(module:service | controller): void;
	use(middleware:middleware|any): void;
	bind():void;
	init(startCallback?:Function, options?:any):void;
	services():service[];
	controllers():controller[];
	middlewares():middleware[];
}

interface options{
	log:boolean;
}

/**
 * @private
 */
const services:service[] = [];
const controllers:controller[] = [];
const middlewares:middleware[] = [];
let lateload:{module:service|middleware, load:string}[] = [];
/**
 * Module exports.
 * @public
 */
export const polyservice:polyservice & {options:{log:boolean}} = {
	register: register,
	use: use,
	bind: _bind,
	init: init,
	services: () => [...services],
	controllers: () => [...controllers],
	middlewares: () => [...middlewares],
	options:{log:true},
};
/**
 * @public
 * @param module 
 */
function register(module:service|controller) {
	if(instanceOfController(module)) {controllers.push(module); return;}
	if(!module.controller) {lateload.push({module:module, load:"bind"}); return;}
	// modify the object so we can bind it in a single for loop
	module.controller = (Array.isArray(module.controller)) ? module.controller : [module.controller];
	services[services.length] = module;
	for(let index:number = 0, len = module.controller.length; index < len; index++ ){
		module.controller[index].bind(module);
		// check if the controllers array has this if not add to it
		if(controllers.includes(module.controller[index])) continue; 
 		controllers[controllers.length] = module.controller[index];
	}
	
}


// @TODO: these loops can be optimized by how we register the services, for example if bucket all the services that need to be registerd with an IO then we can early exit the On^2 loop
/**
 * @public
 */
function init(onStart?:Function, options?:options) {
	polyservice.options = options || polyservice.options;
	_bind();
//	console.log(`Loading ${services.length} service(s)...`)

	onStart();
	//@BUG: This will start an HTTP listener even if there is no controllers tha require the HTTP server
	//HttpListener.Instance.Listen();
	// clear the matrix from memory
}

/**
 * @public
 * @param middleware
 */
function use(middleware:middleware|any) {
	if(!("fnc" in (middleware as any)))
		middleware = {fnc: middleware};
	if(!middleware.controller) { lateload.push({module:middleware, load:"middleware"}); return; }
	middleware.controller = (Array.isArray(middleware.controller)) ? middleware.controller : [middleware.controller];
	middlewares.push(middleware);

	for(let index:number = 0, len = middleware.controller.length; index < len; index++ ){
		middleware.controller[index].middleware(middleware);
		// check if the controllers array has this if not add to it
		if(controllers.includes(middleware.controller[index])) continue; 
 		controllers[controllers.length] = middleware.controller[index];
	}
}

/**
 * @private
 */
function _bind() {
	console.log(`Binding ${services.length} service(s)...`);
	for (let index:number = 0, len = lateload.length; index < len; index++){
		for(let contind:number = 0, len = controllers.length; contind < len; contind++ )
			contind[lateload[index].load](lateload[index].module);
	}
//	for (let index:number = 0, len = services.length; index < len; index++){
//		let controller:controller[] = controllers;
//		if(services[index]?.controller)
//			controller = (isArray(services[index].controller)) ? services[index].controller : [services[index].controller];
//						
//		for(let conitr = 0, con = controller?.length; conitr < con; conitr++){
//			controller[conitr].init(services[index]);
//			console.log("LOADED: ", service.controller.name, services[index].name);
//		}
//	}
//    for (let index = 0; index < services.length; index++) {
//        for (const [iface, obj] of Object.entries(_controller.default)) {
//            if(services[index].controller.includes(obj.identifier) || services[index].controller == "ALL"){
//                console.log("BOUND: ", obj.name, services[index].name);
//                services[index].method.forEach(method => {                   
//                    if(method.protect && !method.protect.key) method.protect.key = "Key"
//                });
//                obj.bind(services[index]);
//            }
//        }        
//    }
}
