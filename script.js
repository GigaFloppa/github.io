const intersect = (first,second,...rest) =>{
    const a = first.filter(el => second.indexOf(el) > -1)
    if([...rest].length === 0) return a
    return intersect(a,...rest)
  }
  const union = (first,second, ...rest) => {
    const a = [...new Set([...first, ...second])]
    if(rest.length === 0 ) return a
    return union(a, ...rest)
  }
  const difference = (a,b) =>{
    
    const _b = b.map(el => el.join(''))
    
    return a.filter(el => _b.indexOf(el.join('')) === -1)
  }
  
  const isEntries = (a,b) => a.reduce((acc, el) => acc && b.indexOf(el) != -1, true)
  
  let logState = 0
  const logButton = document.getElementById('log_button')
  const log =document.getElementById('log')
  log.hidden = 'hidden'
  logButton.addEventListener('click',function(e){

      if(logState == 0){
          logState = 1
          log.hidden = ''
          logButton.textContent = 'Скрыть отчет'
      }
      else{
        logState = 0
        logButton.textContent = 'Показать отчет'
        log.hidden = 'hidden'
      }
  })
  
  
  function Count(max){
    this.max = max
    this.i = 0
  }
  Count.prototype.go = function(){
    this.i++
    if(this.i > this.max){
      _log('Максимальное число итераций')
      return false
    }
    return true
  }
  
  
  function logImportant(...args){
    const log = document.getElementById('log')
    const elem = document.createElement('h3')
    elem.textContent =   args.reduce((text,el) => {
      if(Array.isArray(el)) return text + JSON.stringify(el)
      else return text + el
      
    }, ' ') 
    log.appendChild(elem)
  } 
  function _log(...args){
    const log = document.getElementById('log')
    const elem = document.createElement('p')
    elem.textContent =  '\n' + args.reduce((text,el) => {
      if(Array.isArray(el)) return text + JSON.stringify(el)
      else return text + el
      
    }, ' ')
    log.appendChild(elem)
  } 
  
  
  const showReplace = (replace) => replace.reduce((res,i,j) => res+=`y${j+1} = x${i}; `,'')
  
  document.getElementById('run').onclick = function() {
    let matrix = []
    let numColumns
    try{
      numCollumns =  /^.*[0-9]+.*$/gm.exec(document.getElementById('matrix').value)[0].split(' ').filter(el =>    el != '').length
    }
    catch(err){
      alert('Некорректная матрица')
    }
  
    
    const arr = document.getElementById('matrix').value.split(/\n| /).filter( el => el != '').map(el => el*1)  
    const weights =  document.getElementById('weights').value.split(/\n| /).filter( el => el != '').map(el => el*1)
    for(let i = 0; i < numCollumns; i++){
      matrix[i] = []
      for(let j = 0; j < numCollumns; j++)matrix[i][j] = arr[i * numCollumns + j]
    }
    document.getElementById('log').textContent = ''
    
    const count = new Count(parseInt(document.getElementById('num_iterations').value)) || 128
    const result = run(matrix, weights,count)
    let res =  document.getElementById('result')
    try {
      res.textContent =  ' Замена переменных: ' + ` \n` + showReplace(result.replace)  + '\nПолученная матрица :  \n \n'
    for(let i = 0; i < result.matrix2.length; i++){
        for(let j = 0; j < result.matrix2.length; j++){
            res.textContent += result.matrix2[i][j] + ' '
        }
        res.textContent += '\n'
    }
    }catch(err){
      alert('Максимальное число итераций')
    }
    
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  //Алгоритм
  function run(matrix, weights,iter){
    const log = () =>{
     console.log('u : ', u)
      console.log('v : ', v)
     
    }
    
    const E = []
    const H = []
    
    let P1 = []
    let Q1 = []
    let Q2 = []
    let F1 = []
    let _B1 = []
    let _B2 = []
    let B1 = []
    let B2 = []
    let beta = []
    let alpha = []
    let u = 0
    let v = 0
    let S1 = []
    let S2 = []
    let P2 = []
  
  
  
    let _i
    let _j
    let _beta
    let _alpha
    
    for(let i = 0; i< matrix.length ; ++i) H.push(new Array())
    for(let i = 0; i< matrix.length; ++i) E.push(new Array())
    for(let i = 0;i < matrix.length; ++i){
    
      for(let j = 0; j < matrix.length; ++j){
  
        if(matrix[i][j] === 0){
          E[i].push(j+1)
          H[j].push(i+1)
        }
      }
    }
    for(let i = 0; i< matrix.length; ++i){
      if(!weights[i]) weights[i] = 1
    }
    
    P1[0] = new Array(matrix.length)
    for(let i = 0; i< matrix.length; ++i){
        P1[0].push(i+1)
    }
    P1[0] = P1[0].filter(el => E[el-1].indexOf(el) != -1)
    
    const D = (i,j, p)=> intersect(E[i-1],H[j-1],p)
  
  
  
    const S = (p) =>{
      const arr = []
      p.forEach(i => p.forEach(j =>{
        if(i != j){
          const d = D(i,j,p)
          if(d.indexOf(i) > -1 && d.indexOf(j) > -1){
            const w = d.reduce((sum,el) => sum += weights[el-1],0 )
            arr.push([i,j])
          }
        }
      }))
      return arr
    }
    const V = arr => arr.reduce((sum,el) => sum += weights[el-1],0)
    
    const group = (arr) =>{
        let w = []
        let i = 0
        const iter = (first,...rest) =>{
          
          if(!first) return w
          
          if(!w[i]){
            w[i] = [first]
            return iter(...rest)
          }
          if(isEntries(w[i],E[first - 1])){
            w[i].push(first)
            return iter(...rest)
          }
          i++
          return iter(first,...rest)
        }
        return iter(...arr)
      }
    
    const sort = (array,func) =>{
      
      const arr = [...array]
      const iter = (l,r) =>{
        if(l >= r) return
        p = pivot(l,r)
        iter(l, p)
        iter(p + 1 , r)
      }
      const swap = (i,j,a) =>{
        if(arr[i].length === arr[j].length) return
        let temp = a[i]
        a[i] = a[j]
        a[j] = temp
      }
      const pivot = (l,r) =>{
        const k = arr[Math.floor((l + r) / 2)]
        
        const mid = k.length
        let i = l
        let j = r
        
        while(i<j){
          
          while(arr[i].length < mid) i++
          while(arr[j].length > mid) j--
          if(i >= j)
            break;
          
          if(arr[i].length > arr[j].length)swap(i,j,arr)
          i++
          j--
        }
        return j
      }
      iter(0, arr.length-1)
      return arr
    }
    
    const IIA1 = ()=>{
  
      logImportant('IIA1')
  
      _log('u = ', u, ' v = ', v)
      if(!iter.go())return
      _log('P1' + u , ' = ', P1[u])
      if(P1[u].length === 0) return IIB()
      S1[u] = S(P1[u])
      _log('P1' + u, ' = ', P1[u])
      _log('S1' + u, ' = ', S1[u])
      if(!F1[u]) F1[u] = []
      if(!Q1[u]) Q1[u] = []
      _log('F1' + u + ' = ', F1[u])
      _log('Q1' + u + ' = ', F1[u])
      if(P1[u].filter(el => F1[u].indexOf(el) === -1).length === 0) return IIA1b()
  
  
       _i = P1[u].filter(el => F1[u].indexOf(el) === -1)[0]
       let maxW = weights[0]
      P1[u].filter(el => F1[u].indexOf(el) === -1).forEach(el => {
        if(weights[el - 1] > maxW){
          maxW = weights[el - 1]
          _i = el
        }
      })
      _log('i* = ', _i)
      const diff = difference(S1[u],Q1[u])
  
      if(diff.length === 0) return IIA1c()
  
      _beta = diff[0]
      maxW = V(D(..._beta, P1[u]))
  
      diff.forEach(el =>{
        if(V(D(...el, P1[u])) >  maxW){
          maxW = V(D(...el, P1[u]))
          _beta = [...el]
        }
      })
      _log('beta* = ', _beta)
      if(!V(_beta) > weights[_i-1]) return IIA1c()
  
      let sum = 0
  
        for(let i = 0; i<u;i++){
          sum += V(beta[i])
  
  
        }
      if(sum + V(D(..._beta, P1[u])) > 0.5 * (V(_B1) + V(_B2))){
  
        Q1[u].push(_beta)
        beta[u] = _beta
        P1[u + 1] = D(..._beta, P1[u]).filter(el => el != _beta[0] && el != _beta[1])
        _log('beta* = ' + _beta + ' - узловой на уровне ' + u)
        _log('Q1' + u + ' = ', Q1[u])
        _log('P1' + (u+1) + ' = ' +  P1[u + 1])
        u++
        return IIA1()
      }
      return IIA1b()
    }
    const IIA1b = () =>{
      logImportant('IIA1b')
      log()
      _log('u = ', u, ' v = ', v)
      if(!iter.go())return
      _log('u = ', u)
      if(u == 0) return final()
      Q1[u] = []
      F1[u] = []
      u--
      return IIA1()
    }
    const IIA1c = () =>{
      logImportant('IIA1c')
      log()
      _log('u = ', u, ' v = ', v)
      if(!iter.go())return
      let sum = 0
      for(let i = 0; i < u ;i++){
        sum += V(beta[i])
      }
  
      if(weights[_i-1] + sum <= 0.5 * (V(_B1) + V(_B2))) return IIA1b()
      F1[u].push(_i)
      _log('i* = ', _i, ' - центральный элемент на уровне ' + u)
      _log('F1' + u + ' = ',F1[u])
      B1 = new Array(2*u + 1)
      for(let i = 0; i < u;++i){
        B1[i] = beta[i][0]
        B1[2*u - i] = beta[i][1]
        B1[u] = _i
      }
      _log('B1 = ', B1)
      return III()
    }
    const IIB = () =>{
        logImportant('IIB')
        log()
      _log('u = ', u, ' v = ', v)
        if(!iter.go())return
        if( u > 0){
          B1 = []
  
          for(let i = 0; i < u; i++){
            B1[i] = beta[i][0]
            B1[2*u - i -1 ] = beta[i][1]
  
          }
          _log('B1 = ', B1)
          return III()
        }
        _log('Omega10  - пусто!')
        return
  
    }
  
    const III = () => {
      logImportant('III')
      log()
      _log('u = ', u, ' v = ', v)
      if(!iter.go())return
  
      P2[0] = P1[0].filter(el => B1.indexOf(el) === -1)
      _B1 = []
      _B2 = []
      Q2[0] = []
      v = 0
      _log('P20 = ', P2[0])
      _log('B1^ = []\n B2^ = [] \n Q20 = []')
  
      return IV()
    }
    const IV = () => P2[v].length === 0 ? IVB() : IVA()
  
    const IVA = () =>{
      logImportant('IVA')
      log()
      _log('u = ', u, ' v = ', v)
      if(!iter.go())return
      S2[v] = S(P2[v])
      _log('S2' + v + ' = ', S2[v])
      _j = P2[v][0]
      let maxW = weights[_j-1]
      P2[v].forEach(el => {
        if(weights[el-1] > maxW){
          maxW = weights[el-1]
          _j = el
        }
      })
      _log('j* = ', _j)
      const diff = difference(S2[v],Q2[v])
      if(diff.length === 0) return IVA1c()
  
      _alpha = diff[0]
      maxW = V(D(..._alpha, P2[v]))
  
      let num_uniq_el = 0 
  
      diff.forEach(el => {
        const d = D(...el, P2[v])
        if(V(d) > maxW){
          maxW = V(d)
          _alpha = el
          num_uniq_el = d.filter(el => B1.indexOf(el) === -1).length
        }
      })
      diff.forEach(el =>{
        const d = D(...el, P2[v])
        if(V(d) === maxW && d.filter(el => B1.indexOf(el) == -1).length > num_uniq_el){
          _alpha = el
          num_uniq_el = d.filter(el => B1.indexOf(el) == -1).length 
        }
      })
      _log('alpha* = ', _alpha)
  
  
  
  
      if(weights[_j - 1] >= V(D(..._alpha, P2[v]))) return IVA1c()
  
      let sum = 0
      for(let i = 0; i < v-1; i++){
        sum+=V(alpha[i])
      }
      if(V(B1) + sum + V(D(..._alpha, P2[v])) <= V(_B1) + V(_B2)) return IVA1b()
  
  
      alpha[v] = [..._alpha]
      Q2[v].push([..._alpha])
      _log('alpha* = ' + _alpha + ' - узловой элемент на уровне ' + v)
  
      P2[v+1] = D(...alpha[v],P2[v]).filter(el => el != alpha[v][0] && el != alpha[v][1])
  
      v = v + 1
      Q2[v] = []
      _log('P2' + v + ' = ', P2[v])
      _log('Q2' + v + ' = ', Q2[v])
  
  
      return IV()
    }
    const IVA1b = () =>{
      logImportant('IVA1b')
      _log('u = ', u, ' v = ', v)
      log()
      if(!iter.go())return
      if(v > 0){
        _log('v > 0')
        Q2[v] = []
        _log('Q2' + v + ' = ', Q2[v])
        v--
        _log('v = v - 1')
        return IVA()
      }
      _log('u = u - 1')
      u--
      return IIA1()
    }
  
    const IVA1c = () =>{
      _log('IVA1c')
      _log('u = ', u, ' v = ', v)
      log()
      if(!iter.go())return
      let sum = 0
      for(let i = 0; i < v; ++i){
        sum+= V(alpha[i])
      }
      if(sum + V(B1) + weights[_j - 1] <= V(_B1) + V(_B2)) return IVA1b()
      B2 = new Array(2*v +1)
      for(let i = 0; i < v; ++i){
        B2[i] = alpha[i][0]
        B2[2*v - i] = alpha[i][1]
      }
      B2[v] = _j
      _log('j* = ' + _j + ' - центральный элемент на уровне ' + v)
      _log('B2 = ', B2)
      return IVB1a()
    }
    const IVB = () => v === 0 ? IVB2() : IVB1()
  
    const IVB1 = () =>{
      logImportant('IVB1')
      _log('u = ', u, ' v = ', v)
      log()
      if(!iter.go())return
      B2 = new Array(2*v)
  
      for(let i = 0; i< v; i++){
        B2[i] = alpha[i][0]
        B2[2*v-i - 1] = alpha[i][1]
      }
      _log('B2 = ', B2)
      return IVB1a()
    }
    const IVB1a = ()=>{
      logImportant('IVB1a')
      _log('u = ', u, ' v = ', v)
      log()
      if(!iter.go())return
      _B1 = [...B1]
      _B2 = [...B2]
      _log('B1^ = ',_B1)
      _log('B2^ = ', _B2)
      if(V(_B1) + V(_B2) ===  V(P1[0])) return final()
      return IVA1b()
    }
    const IVB2 = () =>{
      logImportant('IVB2')
      _log('u = ', u, ' v = ', v)
      log()
      if(!iter.go())return
      return final()
    }
  
    const final = () =>{
      logImportant('Конец перебора')
      _log('B1^ = ',_B1,'B2^ = ',_B2)
      
      let unused = new Array(matrix.length)
      for(let i = 0; i<unused.length; i++){
        unused[i] = i+1
      }
      unused = unused.filter(el => _B1.indexOf(el) === -1 && _B2.indexOf(el) === -1)
      
      
      console.log([...group(unused),... group(_B2),...group(_B1)])
      const l = group(_B2).length
      const n = l + group(_B1).length
      const r = [...group(unused), ... group(_B2), ...group(_B1) ].map(el => el.length)
      
      let replace = [...group(unused), ...group(_B2),...group(_B1)]
      console.log(replace)
      replace = replace.reduce((acc,el) => acc = [...acc,...el], [])
      const matrix2 = []
      for(let i = 0; i< matrix.length; i++){
        matrix2[i] = []
        for(let j = 0; j < matrix.length; j++){
          matrix2[i].push(matrix[replace[i] - 1][replace[j] - 1])
        }
      }
      let vol = 0
      const new_w = []
      replace.forEach(el => new_w.push(weights[el-1]))
      console.log(weights.length)
      let wsum = weights.reduce((acc,el) => acc+=el, 0)
      for(let i = r[0] ; i < weights.length; i++) vol+= new_w[i]
      return({_B1,_B2, replace,matrix2, l, n, r, vol, wsum}) 
    }
    
    return IIA1()
  }
  