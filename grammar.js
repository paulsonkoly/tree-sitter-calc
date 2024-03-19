module.exports = grammar({
  name: 'calc',
  extras: $ => [" ", "\t", $.comment],
  rules: {
    program: $ => repeat(seq($.block, $._nl)),

    comment: $ => seq(";", /[^\n]*/),

    block: $ => choice($._curlyblock, $._statement),
    _curlyblock: $ => seq($.delim_obrace, $._nl, $._statements, $.delim_cbrace),
    delim_obrace: $ => "{",
    delim_cbrace: $ => "}",
    _statements: $ => prec.left(repeat1(seq($._statement, $._nl))),
    _statement: $ => choice($.loop, $.conditional, $.returning, $.assignment, $.forloop, $.yield, $._expression),

    _nl: $ => prec.left(repeat1("\n")),

    loop: $ => seq($.kwwhile, $._expression, $.block),
    kwwhile: $ => "while",
    conditional: $ => prec.left(seq($.kwif, $._expression, choice(seq($.block, $.elseblock), $.block))),
    kwif: $ => "if",
    elseblock: $ => seq($.kwelse, $.block),
    kwelse: $ => "else",
    returning: $ => seq($.kwreturn, $._expression),
    kwreturn: $ => "return",
    assignment: $ => seq($.variable_name, $.assignop, $._expression),
    assignop: $ => "=",
    forloop: $ => seq($.kwfor, $.variable_name, $.larrowop, $._expression, $.block),
    kwfor: $ => "for",
    larrowop: $ => "<-",
    yield: $ => seq($.kwyield, $._expression),
    kwyield: $ => "yield",

    _expression: $ => $._relational,

    relationalop: $ => /<|<=|==|!=|>|<|>=|>/,
    _relational: $ => prec.left(seq($._logic, repeat(seq($.relationalop, $._logic)))),

    logicop: $ => /[&|]/,
    _logic: $ => prec.left(seq($._addsub, repeat(seq($.logicop, $._addsub)))),

    addsubop: $ => /[+\-]/,
    _addsub: $ => prec.left(seq($._divmul, repeat(seq($.addsubop, $._divmul)))),

    divmulop: $ => /[*\/%]/,
    _divmul: $ => prec.left(seq($._unary, repeat(seq($.divmulop, $._unary)))),

    unaryop: $ => /[#\-!]/,
    _unary: $ => choice(seq($.unaryop, $._index), $._index),

    _index: $ => prec.left(choice(
      seq($._atom, $.delim_obracket, $._expression, $.delim_colon, $._expression, $.delim_cbracket),
      seq($._atom, $.delim_obracket, $._expression, $.delim_cbracket),
      $._atom,
    )),
    delim_obracket: $ => "[",
    delim_cbracket: $ => "]",
    delim_colon: $ => ":",

    _atom: $ => choice(
      $.func_def,
      $.call,
      $.int_lit,
      $.float_lit,
      $.bool_lit,
      $.string_lit,
      $.array_lit,
      $.variable_name,
      seq($.delim_oparen, $._expression, $.delim_cparen)
    ),
    delim_oparen: $ => "(",
    delim_cparen: $ => ")",

    func_def: $ => seq($.parameters, $.arrowop, $.block),
    arrowop: $ => "->",

    parameters: $ => prec(10, choice(
      seq($.delim_oparen, $.delim_cparen),
      seq(
        $.delim_oparen,
        $.variable_name,
        repeat(seq($.delim_comma, $.variable_name)), 
        $.delim_cparen,
      ),
    )),
    delim_comma: $ => ",",

    array_lit: $ => prec(10, choice(
      seq($.delim_obracket, $.delim_cbracket),
      seq(
        $.delim_obracket,
        $._expression,
        repeat(seq($.delim_comma, $._expression)), 
        $.delim_cbracket,
      ),
    )),

    call: $ => prec(10, seq(
      $.variable_name,
      $._arguments,
    )),

    _arguments: $ => prec(10, choice(
      seq($.delim_oparen, $.delim_cparen),
      seq(
        $.delim_oparen,
        $._expression,
        repeat(seq($.delim_comma, $._expression)), 
        $.delim_cparen,
      ),
    )),

    int_lit: $ => /\d+/,
    float_lit: $ => /\d+(\.\d+)?/,
    bool_lit: $ => /true|false/,
    string_lit: $ => /"([^"]|\\")*"/,
    variable_name: $ => /[a-z]+/,
  }
});

