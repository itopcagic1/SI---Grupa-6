const DOZVOLJENE_ULOGE=['ADMINISTRATOR','NAVIJAC','ORGANIZATOR','IGRAC','TRENER','VLASNIK'];

const requireRole= (...uloge)=>{
    uloge.forEach(uloga=>{
        if(!DOZVOLJENE_ULOGE.includes(uloga)){
            throw new Error(`Nepoznata uloga: ${uloga}`)
        }
    });

    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                greska:'NEOVLASTEN',
                poruka:'Token nije pronađen ili je nevaljan',
            });
        }

        if(!uloge.includes(req.user.uloga)){
            return res.status(403).json({
                greska:'ZABRANJEN_PRISTUP',
                poruka: `Pristup dozvoljen samo za: ${uloge.join(', ')}`,
            });
            
        }

        next();
    };
};

module.exports={requireRole, DOZVOLJENE_ULOGE};