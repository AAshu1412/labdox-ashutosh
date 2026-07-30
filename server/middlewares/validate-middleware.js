
const validate=(schema)=>async (req,res,next)=>{

    try {
        const parseBody= await schema.parseAsync(req.body);
        req.body=parseBody;
        next();
    } catch (err) {
        console.log(`validate-middleware == ${err}`);
        
        const status=422;
        const message= "Fill in the input properly";
        const extraDetails= err.errors[0].message;

        const erro_middle={status,message,extraDetails}
        next(erro_middle);


    }
}

module.exports=validate;