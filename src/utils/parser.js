import deepfilter from 'deep-filter'
import Interpreter from 'js-interpreter';

function objectExpressionToString (properties) {
  if (properties.length === 0) {
    return '{}'
  }

  let str = '{ '

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i]

    str += prop.key.name + ': '

    if (prop.value.type === 'FunctionExpression') {
      str += 'fn()'
    } else if (prop.value.type === 'ArrayExpression') {
      str += arrayExpressionToString(prop.value.elements)
    } else if (prop.value.type === 'ObjectExpression') {
      str += objectExpressionToString(prop.value.properties)
    } else {
      str += prop.value.value
    }

    str += (i === properties.length - 1 ? '' : ', ')
  }

  return str + " }"
}

function arrayExpressionToString (elements) {
  if (elements.length === 0) {
    return '[]'
  }

  let str = '['

  for (let i = 0; i < elements.length; i++) {
    const ele = elements[i]

    if (ele.type === 'FunctionExpression') {
      str += 'fn()'
    } else if (ele.type === 'ArrayExpression') {
      str += arrayExpressionToString(ele.elements)
    } else if (ele.type === 'ObjectExpression') {
      str += objectExpressionToString(ele.properties)
    } else {
      str += ele.value
    }

    str += (i === elements.length - 1 ? '' : ', ')
  }

  return str + ']'
}

export function formatValue (type, init) {
  if (type === 'FunctionExpression') {
    return 'fn()'
  } else if (type === 'ArrayExpression') {
    return arrayExpressionToString(init.elements)
  } else if (type === 'ObjectExpression') {
    return objectExpressionToString(init.properties)
  } else {
    return init.value
  }
}

function interpreterShims (interpreter, scope) {
  interpreter.setProperty(
    scope,
    'alert',
    interpreter.createNativeFunction((text = '') => alert(text))
  )

  const obj = interpreter.createObject(interpreter.OBJECT)

  interpreter.setProperty(
    scope,
    'console',
    obj
  )

  interpreter.setProperty(
    obj,
    'log',
    interpreter.createNativeFunction(
      (text = '') => interpreter.createPrimitive(console.log(text.toString()))
    )
  )
}

let MyInterpreter
export function getInterpreter(code) {
  try {
    let placeholder = new Interpreter(code, interpreterShims)
    MyInterpreter = placeholder
  } catch(e) {
    // Thrown if code is not valid
  }

  return MyInterpreter
}