[2025-12-16 11:00:32] Stopping existing containers...
 Container spotaccount-certbot  Stopping
 Container spotaccount-nginx  Stopping
 Container spotaccount-certbot  Stopped
 Container spotaccount-certbot  Removing
 Container spotaccount-nginx  Stopped
 Container spotaccount-nginx  Removing
 Container spotaccount-nginx  Removed
 Container spotaccount-backend  Stopping
 Container spotaccount-frontend  Stopping
 Container spotaccount-backend  Stopped
 Container spotaccount-backend  Removing
 Container spotaccount-certbot  Removed
 Container spotaccount-backend  Removed
 Container spotaccount-postgres  Stopping
 Container spotaccount-frontend  Stopped
 Container spotaccount-frontend  Removing
 Container spotaccount-postgres  Stopped
 Container spotaccount-postgres  Removing
 Container spotaccount-frontend  Removed
 Container spotaccount-postgres  Removed
 Network spotaccount_app-network  Removing
 Network spotaccount_app-network  Removed
[2025-12-16 11:00:35] Starting new containers...
 Network spotaccount_app-network  Creating
 Network spotaccount_app-network  Created
 Container spotaccount-certbot  Creating
 Container spotaccount-postgres  Creating
 Container spotaccount-frontend  Creating
 Container spotaccount-frontend  Created
 Container spotaccount-postgres  Created
 Container spotaccount-backend  Creating
 Container spotaccount-certbot  Created
 Container spotaccount-backend  Created
 Container spotaccount-nginx  Creating
 Container spotaccount-nginx  Created
 Container spotaccount-postgres  Starting
 Container spotaccount-frontend  Starting
 Container spotaccount-certbot  Starting
 Container spotaccount-frontend  Started
 Container spotaccount-certbot  Started
 Container spotaccount-postgres  Started
 Container spotaccount-postgres  Waiting
 Container spotaccount-postgres  Healthy
 Container spotaccount-backend  Starting
 Container spotaccount-backend  Started
 Container spotaccount-nginx  Starting
 Container spotaccount-nginx  Started
[2025-12-16 11:00:48] Waiting for backend to be healthy...
[2025-12-16 11:01:51] ERROR: Backend health check timed out
[2025-12-16 11:01:51] Showing backend logs:
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments, POST} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/pending-verification, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/:id, GET} route +4ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/:id, PATCH} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/:id, DELETE} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/:id/verify, PATCH} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/payments/:id/cancel, PATCH} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RoutesResolver] UserPaymentsController {/api/user-payments}: +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments, POST} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments, GET} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/pending, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/history, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/stats, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/suggestions/:amount, GET} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/:id, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/:id, PATCH} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/:id, DELETE} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/user-payments/:id/cancel, PATCH} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RoutesResolver] ReportsController {/api/reports}: +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/reports/balance/user/:userId, GET} route +1ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/reports/balance/subscription/:subscriptionId, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/reports/balance/all, GET} route +0ms
[Nest] 23  - 12/16/2025, 11:01:39 AM     LOG [RouterExplorer] Mapped {/api/reports/balance/me, GET} route +1ms
/app/node_modules/@prisma/client/runtime/library.js:112
You may have to run ${qe("prisma generate")} for your changes to take effect.`,this.config.clientVersion);return r}}parseEngineResponse(r){if(!r)throw new V("Response from the Engine was empty",{clientVersion:this.config.clientVersion});try{return JSON.parse(r)}catch{throw new V("Unable to JSON.parse response from engine",{clientVersion:this.config.clientVersion})}}async loadEngine(){if(!this.engine){this.QueryEngineConstructor||(this.library=await this.libraryLoader.loadLibrary(this.config),this.QueryEngineConstructor=this.library.QueryEngine);try{let r=new WeakRef(this);this.adapterPromise||(this.adapterPromise=this.config.adapter?.connect()?.then(tn));let t=await this.adapterPromise;t&&Re("Using driver adapter: %O",t),this.engine=this.wrapEngine(new this.QueryEngineConstructor({datamodel:this.datamodel,env:process.env,logQueries:this.config.logQueries??!1,ignoreEnvVarErrors:!0,datasourceOverrides:this.datasourceOverrides??{},logLevel:this.logLevel,configDir:this.config.cwd,engineProtocol:"json",enableTracing:this.tracingHelper.isEnabled()},n=>{r.deref()?.logger(n)},t))}catch(r){let t=r,n=this.parseInitError(t.message);throw typeof n=="string"?t:new P(n.message,this.config.clientVersion,n.error_code)}}}logger(r){let t=this.parseEngineResponse(r);t&&(t.level=t?.level.toLowerCase()??"unknown",yf(t)?this.logEmitter.emit("query",{timestamp:new Date,query:t.query,params:t.params,duration:Number(t.duration_ms),target:t.module_path}):Ef(t)?this.loggerRustPanic=new ae(Po(this,`${t.message}: ${t.reason} in ${t.file}:${t.line}:${t.column}`),this.config.clientVersion):this.logEmitter.emit(t.level,{timestamp:new Date,message:t.message,target:t.module_path}))}parseInitError(r){try{return JSON.parse(r)}catch{}return r}parseRequestError(r){try{return JSON.parse(r)}catch{}return r}onBeforeExit(){throw new Error('"beforeExit" hook is not applicable to the library engine since Prisma 5.0.0, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.')}async start(){if(this.libraryInstantiationPromise||(this.libraryInstantiationPromise=this.instantiateLibrary()),await this.libraryInstantiationPromise,await this.libraryStoppingPromise,this.libraryStartingPromise)return Re(`library already starting, this.libraryStarted: ${this.libraryStarted}`),this.libraryStartingPromise;if(this.libraryStarted)return;let r=async()=>{Re("library starting");try{let t={traceparent:this.tracingHelper.getTraceParent()};await this.engine?.connect(JSON.stringify(t)),this.libraryStarted=!0,this.adapterPromise||(this.adapterPromise=this.config.adapter?.connect()?.then(tn)),await this.adapterPromise,Re("library started")}catch(t){let n=this.parseInitError(t.message);throw typeof n=="string"?t:new P(n.message,this.config.clientVersion,n.error_code)}finally{this.libraryStartingPromise=void 0}};return this.libraryStartingPromise=this.tracingHelper.runInChildSpan("connect",r),this.libraryStartingPromise}async stop(){if(await this.libraryInstantiationPromise,await this.libraryStartingPromise,await this.executingQueryPromise,this.libraryStoppingPromise)return Re("library is already stopping"),this.libraryStoppingPromise;if(!this.libraryStarted){await(await this.adapterPromise)?.dispose(),this.adapterPromise=void 0;return}let r=async()=>{await new Promise(n=>setImmediate(n)),Re("library stopping");let t={traceparent:this.tracingHelper.getTraceParent()};await this.engine?.disconnect(JSON.stringify(t)),this.engine?.free&&this.engine.free(),this.engine=void 0,this.libraryStarted=!1,this.libraryStoppingPromise=void 0,this.libraryInstantiationPromise=void 0,await(await this.adapterPromise)?.dispose(),this.adapterPromise=void 0,Re("library stopped")};return this.libraryStoppingPromise=this.tracingHelper.runInChildSpan("disconnect",r),this.libraryStoppingPromise}version(){return this.versionInfo=this.library?.version(),this.versionInfo?.version??"unknown"}debugPanic(r){return this.library?.debugPanic(r)}async request(r,{traceparent:t,interactiveTransaction:n}){Re(`sending request, this.libraryStarted: ${this.libraryStarted}`);let i=JSON.stringify({traceparent:t}),o=JSON.stringify(r);try{await this.start();let s=await this.adapterPromise;this.executingQueryPromise=this.engine?.query(o,i,n?.id),this.lastQuery=o;let a=this.parseEngineResponse(await this.executingQueryPromise);if(a.errors)throw a.errors.length===1?this.buildQueryError(a.errors[0],s?.errorRegistry):new V(JSON.stringify(a.errors),{clientVersion:this.config.clientVersion});if(this.loggerRustPanic)throw this.loggerRustPanic;return{data:a}}catch(s){if(s instanceof P)throw s;if(s.code==="GenericFailure"&&s.message?.startsWith("PANIC:"))throw new ae(Po(this,s.message),this.config.clientVersion);let a=this.parseRequestError(s.message);throw typeof a=="string"?s:new V(`${a.message}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

PrismaClientInitializationError: error: Error validating datasource `db`: the URL must start with the protocol `file:`.
  -->  schema.prisma:10
   | 
 9 |   provider = "sqlite"
10 |   url      = env("DATABASE_URL")
   | 

Validation Error Count: 1
    at r (/app/node_modules/@prisma/client/runtime/library.js:112:2770)
    at async Proxy.onModuleInit (/app/dist/database/prisma.service.js:14:9)
    at async Promise.all (index 0)
    at async callModuleInitHook (/app/node_modules/@nestjs/core/hooks/on-module-init.hook.js:43:5)
    at async NestApplication.callInitHook (/app/node_modules/@nestjs/core/nest-application-context.js:242:13)
    at async NestApplication.init (/app/node_modules/@nestjs/core/nest-application.js:103:9)
    at async NestApplication.listen (/app/node_modules/@nestjs/core/nest-application.js:175:13)
    at async bootstrap (/app/dist/main.js:58:5) {
  clientVersion: '6.17.1',
  errorCode: 'P1012',
  retryable: undefined
}

Node.js v18.20.8