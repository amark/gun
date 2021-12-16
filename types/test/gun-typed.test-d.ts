import Gun = require('../../index');
const gun = Gun<ExampleState>()

type ExampleState={
    a:{
        b:{
            c:{
                d: Record<string,string>
            }
        }
    }
}

gun.get("a").get("b").get("c").get("d").get("anystring").on(x=>x.startsWith("some"))