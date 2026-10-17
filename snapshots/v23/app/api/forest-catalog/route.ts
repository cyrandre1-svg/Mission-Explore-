import {forestCatalog} from '../../../lib/maps/forest';
export async function GET(){try{return Response.json(await forestCatalog(),{headers:{'Cache-Control':'public, max-age=3600'}})}catch{return Response.json({error:'Catalogue MRNF indisponible; les années ne peuvent pas être vérifiées.'},{status:502})}}
