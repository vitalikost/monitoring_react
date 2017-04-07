
window.ee = new EventEmitter();

function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            }
            else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}


class Connect extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ip_client: "http://127.0.0.1:3000/",
            result_connect:["Одыжаем результат"],
            connect:"Не подлючения",
            color:"black",
            visible:"none"
        };

        this.on_Change_ip = this.on_Change_ip.bind(this);
        this.on_click_button = this.on_click_button.bind(this);

    }

    on_Change_ip(e) {
        var obj={};
        obj.ip_client= e.target.value;
        this.setState(obj);
    }

    on_click_button() {
        console.log("url:",this.state.ip_client);
        var self = this;
        var obj={};
        get(this.state.ip_client+"whatareyou").then(function (result) {
            var str = result;
            obj.result_connect=  str.replace(/\n\r/g,'<br>').split("<br>");
            console.log(obj.result_connect);
            obj.connect= "Подключено "+self.state.ip_client;
            obj.color= "green";
            self.setState(obj);
            window.ee.emit('visible.settings', {visible:true,ip_client:self.state.ip_client});
        }).catch(function (err) {
            obj.result_connect= err.toString().split("<br>");
            obj.color= "red";
            self.setState(obj);
            window.ee.emit('visible.settings', {visible:false,ip_client:""});
        });
    }

    render() {
        var self = this;
        return (
        <div>
             <div id="connect_options">
                <h1>{this.props.welcome}</h1>
                <label>Адрес:</label>
                <input id="ip_server" defaultValue="http://127.0.0.1:3000/" onChange={this.on_Change_ip}/>
                <button onClick={this.on_click_button}>Подключить</button>
                    {
                        this.state.result_connect.map(function(item, index){
                            return <div key={index} style={{color:self.state.color}}>{item}</div>
                        })
                    }
             </div>
            {/* childrens*/}

        </div>
        );
    }
}

//Setting up monitoring
class SettingMonitoring extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            timer:"Таймер отключен",
            timer_interval:1,
            ticks:0,
            visible:false,
            ip_client:""
        };

        this.activate_timer = this.activate_timer.bind(this);
        this.clear_timer = this.clear_timer.bind(this);
        this.on_Change_timer_interval =this.on_Change_timer_interval.bind(this);
        this.on_Change_limit_ticks = this.on_Change_limit_ticks.bind(this);
        this.on_Change_limit_ticks = this.on_Change_limit_ticks.bind(this);
        this.tick = this.tick.bind(this);

    }

    activate_timer(){
        this.setState({timer:"Таймер активирован"});
        this.timerId = setInterval(this.tick,  this.state.timer_interval*1000);

        if(this.state.ticks>0)
            this.tick_count = this.state.ticks;

        this.tick();
    }

    clear_timer(){
        this.setState({timer:"Таймер остановлен"});
        clearInterval(this.timerId);
        delete this["tick_count"];

    }

    on_Change_timer_interval(e) {
        var obj={};
        obj.timer_interval= e.target.value;
        this.setState(obj);
    }

    on_Change_limit_ticks(e) {
        var obj={};
        obj.ticks= e.target.value;
        this.setState(obj);
    }

    tick(){

        if(this.tick_count!='undefined')
        {
            if(this.tick_count === 0)
            {
                this.clear_timer();
                return;
            }
            this.tick_count=this.tick_count-1;
        }

        //console.log("url:",this.props.ip_client);
        var url =this.state.ip_client+"temperature";
        get(url).then(function (result) {
            console.log(result);
        }).catch(function (err) {
            console.log(err);
        });



    }

    show_tiks(){
        if(this.state.ticks>0)
        { return " кво. запросов "+this.state.ticks; }
        else {
            return "";
        }

    }



    componentWillMount(){
        var self = this;
        window.ee.addListener('visible.settings', function(item) {
            self.setState({visible: item.visible, ip_client: item.ip_client});
        });

    }


    render() {
        if(this.state.visible){
            return (
                <div id="setting_monitoring" >
                    <h1>{this.props.welcome}</h1>
                    <label>Запрос данных каждые:</label>
                    <input type="number" id="timer_interval" defaultValue="1" style={{width:'60px'}} onChange={this.on_Change_timer_interval} />
                    <label> сек.</label><br></br>
                    <button id="start_timer" onClick={this.activate_timer}>Старт</button>
                    <button id="stop_timer" onClick={this.clear_timer}>Стоп</button>
                    <button id="create_chart" onClick={this.props.clean_result} >Привет от наследника</button>
                    <input type="checkbox" id="online_chart" defaultChecked="true" />
                    <label>Онлайн</label><br></br>
                    <label>Количество запросов:</label>
                    <input type="number" id="limit_ticks" defaultValue="0" style={{width:'60px'}} onChange={this.on_Change_limit_ticks} />
                    <p>{this.state.ip_client +' интервал '+this.state.timer_interval+' сек.'+this.show_tiks()}</p>
                    <p>{this.state.timer}</p>
                </div>
            );


        } else { return null;}
    }
}



ReactDOM.render(
    <div>
    <Connect welcome ="Система мониторинга:" />
    <SettingMonitoring welcome ="Настройка мониторинга:" />
    </div>,
    document.getElementById("root")
);