import { Response,Headers } from 'cross-fetch';
//import { Response,Headers } from 'node-fetch';

export async function handleResponse(response){    
  let wrapHeaders = true; // feed {headers} instead of headers to Response
  let finalResponse = { body:"",headers:{} };
  if(typeof response==='object' && response[0]){
    finalResponse.headers.status = response[0];
    finalResponse.body = response[1] || "";
  }
  else if(typeof response==='number'){
    wrapHeaders = false;
    finalResponse.headers.status=response; // from handleRequest    
  }
  else if(typeof response==='boolean'){
    finalResponse.headers.status = response ? 200 : 500;
  }
  else if(typeof response==='string'){
    finalResponse.headers.status = 200;
    finalResponse.body = response;
  }
  else if(typeof response==='object'){
    wrapHeaders = false;
    finalResponse = response;
  }
// console.log(finalResponse)
    const pathname = this.item.pathname;
    let name =  await this.perform('STORAGE_NAME');
    const item = this.item;
    const request = this.request;
    const fn = this.basename(pathname,item.pathHandler)


    let headers = {}; // our constructed headers

//    headers.location = headers.url = headers.location || this.response.headers.location

    if(this.response && this.response.headers)
      headers.location = this.response.headers.location

    headers.date = headers.date
      || new Date(Date.now()).toISOString()

    headers.allow = headers.allow
      || createAllowHeader(this.patch,this.item.mode)

    let wacAllow = headers['wac-allow'] 
      || createWacHeader(item.mode)
    if( wacAllow ) headers['wac-allow'] = wacAllow;

    headers['x-powered-by'] = headers['x-powered-by'] ||
      name
    const options = {};
    options.item = item; 
    options.request = request;
    const ext = this.getExtension(pathname)

    headers['content-type']
       = headers['content-type']
	  || this.getContentType(ext,item.isContainer==='Container'?"Container":"Resource")
    if(!headers['content-type']){
       delete headers['content-type']
    }
    else {
      headers['content-type'] = headers['content-type'].replace(/;.*/,'');
    }

    if(this.patch) {
     headers['ms-author-via']=["SPARQL"];
     headers['accept-patch']=['application/sparql-update'];
    }
    headers.link = headers.link;
    if( !headers.link ) {
        if( ext === '.acl' ) {
          headers.link =
            `<http://www.w3.org/ns/ldp#Resource>; rel="type"`
        }
        else if( ext === '.meta' ) {
          headers.link =
           `<${fn}.acl>; rel="acl",`
          +`<http://www.w3.org/ns/ldp#Resource>; rel="type"`
        }
        else if ( item.isContainer ) {
          headers.link =
           `<.meta>; rel="describedBy", <.acl>; rel="acl",`
          +`<http://www.w3.org/ns/ldp#Container>; rel="type",`
          +`<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"`
        }
        else {
          headers.link =
           `<${fn}.meta>; rel="describedBy", <${fn}.acl>; rel="acl",`
          +`<http://www.w3.org/ns/ldp#Resource>; rel="type"`
        }
    }

for(var k in headers) {
  if(typeof headers[k]==='undefined') delete headers[k];
}


    // merge headers created above with headers from response, prefer response
    Object.assign( headers, finalResponse.headers );

//headers = typeof response==='number' || this.request.method==='PATCH' ? headers : {headers} 

headers = wrapHeaders ? {headers}  : headers;

//console.log(headers);


    let resp
    try{
      resp = new Response( finalResponse.body, headers)
    } catch(e){console.log(e)}
//    for(var h of resp.headers.entries()){console.log(1,h)};
//console.log('handleResponse2',resp)
    return resp
  } // end of getHeaders()

  function createWacHeader( mode ){
    if(!mode.read && !mode.write) return null;
    if(mode.read && !mode.write) return `user="read",public="read"`
    if(!mode.read && mode.write) return `user="append write control",public=""`
    return `user="read write append control",public="read"`
  }

  function createAllowHeader( patch, mode ){
    return 'OPTIONS,HEAD' 
         + (mode.read ?',GET' : '') 
         + (mode.write ?',POST,PUT,DELETE' : '') 
         + (mode.write && patch ?',PATCH' : '') 
  }