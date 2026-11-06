OPTION _EXPLICIT

' DIVER_QB64_STAGE3_v01.bas
'
' Stage 3 feasibility program for a modern QB64-PE translation of DIVER.
' It executes the DIVER start-up and input sequence through [1445], including
' the initial depth and air displays, then stops before the main scheduler.
'
' Target logical display:
'   80 x 48 character cells
'   160 x 192 graphics blocks (2 x 4 blocks per character cell)
'
' QB64-PE: https://www.qb64phoenix.com/

CONST CC_TEXT_COLS = 80
CONST CC_TEXT_ROWS = 48
CONST CC_GFX_COLS = 160
CONST CC_GFX_ROWS = 192

CONST CC_TEXT_MODE = 0
CONST CC_PLOT_MODE = 1

CONST CC_CELL_TEXT = 0
CONST CC_CELL_GRAPHICS = 1
CONST CC_CELL_LARGE_CONTINUATION = 2

CONST CC_PENDING_NONE = 0
CONST CC_PENDING_CCI = 6
CONST CC_PENDING_CURSOR_X = 301
CONST CC_PENDING_CURSOR_Y = 302
CONST CC_PENDING_ESCAPE = 27

CONST CC_WRITE_HORIZONTAL = 0
CONST CC_WRITE_VERTICAL = 1

' The logical Compucolor graphics block is deliberately rectangular here.
' Four screen pixels across and two down give an 8 x 8 normal character cell.
CONST CC_BLOCK_W = 4
CONST CC_BLOCK_H = 2
CONST CC_DISPLAY_W = CC_GFX_COLS * CC_BLOCK_W
CONST CC_DISPLAY_H = CC_GFX_ROWS * CC_BLOCK_H
CONST CC_PANEL_W = 430
CONST CC_WINDOW_W = CC_DISPLAY_W + CC_PANEL_W
CONST CC_WINDOW_H = 620

TYPE CCStateType
    Mode AS INTEGER
    Pending AS INTEGER
    PendingX AS INTEGER

    PlotSubmode AS INTEGER
    PlotForceData AS INTEGER

    TextColumn AS INTEGER
    TextRow AS INTEGER
    WriteDirection AS INTEGER

    Foreground AS INTEGER
    Background AS INTEGER
    Flag AS INTEGER
    LargeCharacters AS INTEGER
    ColourTarget AS INTEGER

    PointX AS INTEGER
    PointY AS INTEGER
    BarOrigin AS INTEGER
    BarOther AS INTEGER

    SuppressedTextBytes AS LONG
    UnsupportedPlotBytes AS LONG
END TYPE

DECLARE SUB CCInitialise ()
DECLARE SUB CCReset ()
DECLARE SUB CCPlotBegin ()
DECLARE SUB CCSend (Value AS INTEGER)
DECLARE SUB CCHandleControl (Value AS INTEGER)
DECLARE SUB CCHandlePending (Value AS INTEGER)
DECLARE SUB CCHandlePlotData (Value AS INTEGER)
DECLARE SUB CCApplyCCI (Value AS INTEGER)
DECLARE SUB CCWriteText (TextValue AS STRING)
DECLARE SUB CCWriteCharacter (CharacterCode AS INTEGER)
DECLARE SUB CCNewLine ()
DECLARE SUB CCClearPage ()
DECLARE SUB CCClearTextCell (Column AS INTEGER, Row AS INTEGER)
DECLARE SUB CCSetGraphicsBlock (X AS INTEGER, Y AS INTEGER)
DECLARE SUB CCDrawHorizontalBar (X0 AS INTEGER, X1 AS INTEGER, Y AS INTEGER)
DECLARE SUB CCDrawVerticalBar (X AS INTEGER, Y0 AS INTEGER, Y1 AS INTEGER)
DECLARE SUB CCDrawVector (X1 AS INTEGER, Y1 AS INTEGER, X0 AS INTEGER, Y0 AS INTEGER)
DECLARE SUB CCRender ()
DECLARE SUB CCRenderCharacter (Column AS INTEGER, Row AS INTEGER)
DECLARE SUB CCRenderPanel ()
DECLARE SUB CCAddResult (Description AS STRING, Passed AS INTEGER)
DECLARE SUB CCRunTests ()
DECLARE SUB CCBuildEngineDemonstration ()
DECLARE SUB CCBuildHiddenTitleDemonstration ()
DECLARE SUB CCBuildVisibleTitleDemonstration ()
DECLARE SUB CCBuildPlotDemonstration ()
DECLARE SUB DIVERInteractiveStartup ()
DECLARE SUB DIVERDisplayMonitorCell (BASIC_ID AS INTEGER, BASIC_VA AS INTEGER, BASIC_CO AS INTEGER, BASIC_FL AS INTEGER)
DECLARE SUB DIVERWriteVerticalLegend ()
DECLARE SUB DIVERClearInputLine (CharacterCount AS INTEGER)
DECLARE SUB DIVERGosub6600 ()
DECLARE SUB DIVERGosub6700 ()
DECLARE SUB DIVERDisplayDepthTrend (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
DECLARE SUB DIVERDisplayAirGauge (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
DECLARE FUNCTION DIVERReadInput$ (PromptText AS STRING)
DECLARE SUB CCSend1010 ()
DECLARE SUB CCSendPlot2 (A AS INTEGER, B AS INTEGER)
DECLARE SUB CCSendPlot3 (A AS INTEGER, B AS INTEGER, C AS INTEGER)
DECLARE SUB CCSendPlot4 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER)
DECLARE SUB CCSendPlot6 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER)
DECLARE SUB CCSendPlot7 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER, G AS INTEGER)
DECLARE FUNCTION CCWrapX% (Value AS INTEGER)
DECLARE FUNCTION CCWrapY% (Value AS INTEGER)
DECLARE FUNCTION CCCountGraphicsBlocks& ()
DECLARE FUNCTION CCTextAt% (Column AS INTEGER, Row AS INTEGER, CharacterCode AS INTEGER)

DIM SHARED CCState AS CCStateType

DIM SHARED CCCellKind(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextCode(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextForeground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextBackground(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextBlink(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER
DIM SHARED CCTextLarge(0 TO CC_TEXT_COLS - 1, 0 TO CC_TEXT_ROWS - 1) AS INTEGER

DIM SHARED CCGraphicsColour(0 TO CC_GFX_COLS - 1, 0 TO CC_GFX_ROWS - 1) AS INTEGER
DIM SHARED CCPalette(0 TO 7) AS _UNSIGNED LONG

DIM SHARED CCWindow AS LONG
DIM SHARED CCFontNormal AS LONG
DIM SHARED CCResultText(1 TO 40) AS STRING
DIM SHARED CCResultPassed(1 TO 40) AS INTEGER
DIM SHARED CCResultCount AS INTEGER
DIM SHARED CCScenario AS STRING

DIM SHARED BASIC_WD AS SINGLE
DIM SHARED BASIC_DR AS SINGLE
DIM SHARED BASIC_AR AS SINGLE
DIM SHARED BASIC_AD AS SINGLE
DIM SHARED BASIC_CL AS SINGLE
DIM SHARED BASIC_TK AS SINGLE
DIM SHARED BASIC_IK AS SINGLE
DIM SHARED BASIC_XS AS SINGLE
DIM SHARED BASIC_YS AS SINGLE
DIM SHARED BASIC_TimeMode AS STRING
DIM SHARED BASIC_AY AS SINGLE
DIM SHARED BASIC_LA AS SINGLE

DIM KeyValue AS LONG
DIM Finished AS INTEGER

CCInitialise
DIVERInteractiveStartup

DO
    CCRender
    _DISPLAY

    KeyValue = _KEYHIT
    SELECT CASE KeyValue
        CASE 114, 82 ' R
            DIVERInteractiveStartup
        CASE 27
            Finished = -1
    END SELECT

    _LIMIT 30
LOOP UNTIL Finished

IF CCFontNormal > 0 AND CCFontNormal <> 8 THEN _FREEFONT CCFontNormal
SYSTEM


SUB CCInitialise
    DIM FontPath AS STRING

    CCWindow = _NEWIMAGE(CC_WINDOW_W, CC_WINDOW_H, 32)
    SCREEN CCWindow
    _DEST CCWindow

    ' Bedstead is the same period-style screen font used by the completed
    ' browser reconstruction. Keep the QB64 built-in 8-pixel font as a safe
    ' fallback so the program still runs if the companion font is absent.
    CCFontNormal = -1
    FontPath = "bedstead.regular.otf"
    IF _FILEEXISTS(FontPath) THEN CCFontNormal = _LOADFONT(FontPath, 8, "MONOSPACE,DONTBLEND")
    IF CCFontNormal <= 0 THEN
        FontPath = _STARTDIR$ + "bedstead.regular.otf"
        IF _FILEEXISTS(FontPath) THEN CCFontNormal = _LOADFONT(FontPath, 8, "MONOSPACE,DONTBLEND")
    END IF
    IF CCFontNormal <= 0 THEN CCFontNormal = 8

    _FONT CCFontNormal
    _TITLE "DIVER QB64 Stage 3 v02"

    ' Compucolor colour indices 0..7: black, red, green, yellow,
    ' blue, magenta, cyan and white.
    CCPalette(0) = _RGB32(5, 5, 5)
    CCPalette(1) = _RGB32(255, 51, 51)
    CCPalette(2) = _RGB32(0, 204, 0)
    CCPalette(3) = _RGB32(204, 204, 0)
    CCPalette(4) = _RGB32(0, 51, 170)
    CCPalette(5) = _RGB32(204, 0, 204)
    CCPalette(6) = _RGB32(0, 200, 184)
    CCPalette(7) = _RGB32(221, 221, 221)

    CCReset
END SUB


SUB CCReset
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER

    CCState.Mode = CC_TEXT_MODE
    CCState.Pending = CC_PENDING_NONE
    CCState.PendingX = 0
    CCState.PlotSubmode = 253
    CCState.PlotForceData = 0
    CCState.TextColumn = 0
    CCState.TextRow = 0
    CCState.WriteDirection = CC_WRITE_HORIZONTAL
    CCState.Foreground = 7
    CCState.Background = 0
    CCState.Flag = 0
    CCState.LargeCharacters = 0
    CCState.ColourTarget = 0
    CCState.PointX = 0
    CCState.PointY = 0
    CCState.BarOrigin = 0
    CCState.BarOther = 0
    CCState.SuppressedTextBytes = 0
    CCState.UnsupportedPlotBytes = 0

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            CCTextLarge(Column, Row) = 0
        NEXT Column
    NEXT Row

    FOR Y = 0 TO CC_GFX_ROWS - 1
        FOR X = 0 TO CC_GFX_COLS - 1
            CCGraphicsColour(X, Y) = -1
        NEXT X
    NEXT Y
END SUB


SUB CCPlotBegin
    ' Marks a BASIC PLOT-statement boundary. The real terminal receives a
    ' continuous byte stream, but DIVER also sends ordinary terminal controls
    ' at statement boundaries while Graphic Plot Mode remains active.
    '
    ' Plot submode state and partially supplied arguments are not reset.
END SUB


SUB CCSend (Value AS INTEGER)
    DIM IsPlotSubmode AS INTEGER

    Value = Value AND 255

    IF CCState.Pending <> CC_PENDING_NONE THEN
        CCHandlePending Value
        EXIT SUB
    END IF

    ' Codes 29 and 30 leave a colour field selected. The following colour
    ' value is data even though values 16..23 are below printable ASCII.
    IF CCState.ColourTarget <> 0 AND Value >= 16 AND Value <= 23 THEN
        IF CCState.ColourTarget = 1 THEN
            CCState.Foreground = Value AND 7
        ELSE
            CCState.Background = Value AND 7
        END IF
        CCState.ColourTarget = 0
        EXIT SUB
    END IF

    IF CCState.Mode = CC_PLOT_MODE THEN
        IF Value = 255 THEN
            CCState.Mode = CC_TEXT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0
            EXIT SUB
        END IF

        IsPlotSubmode = (Value >= 240 AND Value <= 254)
        IF IsPlotSubmode THEN
            CCState.PlotSubmode = Value
            CCState.PlotForceData = -1
            EXIT SUB
        END IF

        ' Once a plot submode has requested a coordinate, all values in the
        ' documented coordinate range are data, including control-code values.
        IF CCState.PlotForceData THEN
            CCHandlePlotData Value
            EXIT SUB
        END IF

        ' These controls are used by DIVER while Plot Mode remains active.
        SELECT CASE Value
            CASE 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
                CCHandleControl Value
            CASE ELSE
                CCHandlePlotData Value
        END SELECT
        EXIT SUB
    END IF

    SELECT CASE Value
        CASE 2, 3, 6, 8, 12, 14, 15, 27, 29, 30, 31
            CCHandleControl Value
        CASE 7
            BEEP
        CASE 32 TO 126
            CCWriteCharacter Value
        CASE ELSE
            ' Other terminal bytes are outside the present DIVER subset.
    END SELECT
END SUB


SUB CCHandleControl (Value AS INTEGER)
    SELECT CASE Value
        CASE 2
            CCState.Mode = CC_PLOT_MODE
            CCState.PlotSubmode = 253
            CCState.PlotForceData = -1

        CASE 3
            CCState.Pending = CC_PENDING_CURSOR_X

        CASE 6
            CCState.Pending = CC_PENDING_CCI

        CASE 8
            CCState.TextColumn = 0
            CCState.TextRow = 0

        CASE 12
            CCClearPage

        CASE 14
            CCState.LargeCharacters = -1

        CASE 15
            CCState.LargeCharacters = 0
            CCState.Flag = 0

        CASE 27
            CCState.Pending = CC_PENDING_ESCAPE

        CASE 29
            ' The next colour-value byte (16..23) selects foreground.
            CCState.ColourTarget = 1

        CASE 30
            ' The next colour-value byte (16..23) selects background.
            CCState.ColourTarget = 2

        CASE 31
            CCState.Flag = -1
    END SELECT
END SUB


SUB CCHandlePending (Value AS INTEGER)
    SELECT CASE CCState.Pending
        CASE CC_PENDING_CCI
            CCApplyCCI Value
            CCState.Pending = CC_PENDING_NONE

        CASE CC_PENDING_CURSOR_X
            CCState.PendingX = Value
            CCState.Pending = CC_PENDING_CURSOR_Y

        CASE CC_PENDING_CURSOR_Y
            CCState.TextColumn = CCState.PendingX
            CCState.TextRow = Value
            CCState.Pending = CC_PENDING_NONE

        CASE CC_PENDING_ESCAPE
            SELECT CASE Value
                CASE 10
                    CCState.WriteDirection = CC_WRITE_VERTICAL
                CASE 11
                    CCState.WriteDirection = CC_WRITE_HORIZONTAL
            END SELECT
            CCState.Pending = CC_PENDING_NONE
    END SELECT
END SUB


SUB CCApplyCCI (Value AS INTEGER)
    ' CCI status bytes hold foreground in bits 0..2, background in bits 3..5
    ' and the Flag/blink bit in bit 6. Code 14 controls double-height output.
    CCState.Foreground = Value AND 7
    CCState.Background = (Value \ 8) AND 7
    CCState.Flag = ((Value AND 64) <> 0)
    CCState.ColourTarget = 0
END SUB


SUB CCHandlePlotData (Value AS INTEGER)
    ' Submode transitions follow the terminal manual. Codes 253/252 define
    ' an X,Y point. 250/249/248 draw repeated horizontal bars. 246/245/244
    ' draw repeated vertical bars. 242/241 draw vectors from the point last
    ' established by Point Plot to each new vector endpoint.
    SELECT CASE CCState.PlotSubmode
        CASE 253 ' X Point Plot
            CCState.PointX = CCWrapX%(Value)
            CCState.PlotSubmode = 252
            CCState.PlotForceData = -1

        CASE 252 ' Y Point Plot
            CCState.PointY = CCWrapY%(Value)
            CCSetGraphicsBlock CCState.PointX, CCState.PointY
            CCState.PlotSubmode = 253
            CCState.PlotForceData = 0

        CASE 250 ' X Bar Graph, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        CASE 249 ' X Bar Graph, Y
            CCState.BarOther = CCWrapY%(Value)
            CCState.PlotSubmode = 248
            CCState.PlotForceData = -1

        CASE 248 ' X Bar Graph, X Max
            CCDrawHorizontalBar CCState.BarOrigin, CCWrapX%(Value), CCState.BarOther
            CCState.PlotSubmode = 249
            CCState.PlotForceData = -1

        CASE 246 ' Y Bar Graph, Y0
            CCState.BarOrigin = CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        CASE 245 ' Y Bar Graph, X
            CCState.BarOther = CCWrapX%(Value)
            CCState.PlotSubmode = 244
            CCState.PlotForceData = -1

        CASE 244 ' Y Bar Graph, Y Max
            CCDrawVerticalBar CCState.BarOther, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PlotSubmode = 245
            CCState.PlotForceData = -1

        CASE 242 ' Vector Mode, X0
            CCState.BarOrigin = CCWrapX%(Value)
            CCState.PlotSubmode = 241
            CCState.PlotForceData = -1

        CASE 241 ' Vector Mode, Y0
            CCDrawVector CCState.PointX, CCState.PointY, CCState.BarOrigin, CCWrapY%(Value)
            CCState.PointX = CCState.BarOrigin
            CCState.PointY = CCWrapY%(Value)
            CCState.PlotSubmode = 242
            CCState.PlotForceData = -1

        CASE ELSE
            CCState.UnsupportedPlotBytes = CCState.UnsupportedPlotBytes + 1
            CCState.PlotForceData = 0
    END SELECT
END SUB


FUNCTION CCWrapX% (Value AS INTEGER)
    DIM Result AS INTEGER

    Result = Value MOD CC_GFX_COLS
    IF Result < 0 THEN Result = Result + CC_GFX_COLS
    CCWrapX% = Result
END FUNCTION


FUNCTION CCWrapY% (Value AS INTEGER)
    DIM Result AS INTEGER

    Result = Value MOD CC_GFX_ROWS
    IF Result < 0 THEN Result = Result + CC_GFX_ROWS
    CCWrapY% = Result
END FUNCTION


SUB CCWriteText (TextValue AS STRING)
    DIM Index AS INTEGER

    IF CCState.Mode = CC_PLOT_MODE THEN
        ' Verified DIVER behaviour: ordinary PRINT text is not displayed while
        ' Graphic Plot Mode remains active. V01 records those bytes rather than
        ' inventing unverified raster marks for printable characters.
        CCState.SuppressedTextBytes = CCState.SuppressedTextBytes + LEN(TextValue)
        EXIT SUB
    END IF

    FOR Index = 1 TO LEN(TextValue)
        CCWriteCharacter ASC(MID$(TextValue, Index, 1))
    NEXT Index
END SUB


SUB CCWriteCharacter (CharacterCode AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER

    ' Codes 16..23 following 29 or 30 select one of the eight colours.
    IF CCState.ColourTarget <> 0 AND CharacterCode >= 16 AND CharacterCode <= 23 THEN
        IF CCState.ColourTarget = 1 THEN
            CCState.Foreground = CharacterCode AND 7
        ELSE
            CCState.Background = CharacterCode AND 7
        END IF
        CCState.ColourTarget = 0
        EXIT SUB
    END IF

    Column = CCState.TextColumn
    Row = CCState.TextRow

    ' Column 80 is deliberately used by DIVER to move the cursor off-screen.
    IF Column >= 0 AND Column < CC_TEXT_COLS AND Row >= 0 AND Row < CC_TEXT_ROWS THEN
        CCClearTextCell Column, Row
        CCCellKind(Column, Row) = CC_CELL_TEXT
        CCTextCode(Column, Row) = CharacterCode
        CCTextForeground(Column, Row) = CCState.Foreground
        CCTextBackground(Column, Row) = CCState.Background
        CCTextBlink(Column, Row) = CCState.Flag
        CCTextLarge(Column, Row) = CCState.LargeCharacters

        IF CCState.LargeCharacters AND Row < CC_TEXT_ROWS - 1 THEN
            CCClearTextCell Column, Row + 1
            CCCellKind(Column, Row + 1) = CC_CELL_LARGE_CONTINUATION
            CCTextBackground(Column, Row + 1) = CCState.Background
        END IF
    END IF

    IF CCState.WriteDirection = CC_WRITE_VERTICAL THEN
        CCState.TextRow = CCState.TextRow + 1
    ELSE
        CCState.TextColumn = CCState.TextColumn + 1
    END IF
END SUB


SUB CCNewLine
    IF CCState.LargeCharacters THEN
        CCState.TextRow = CCState.TextRow + 2
    ELSE
        CCState.TextRow = CCState.TextRow + 1
    END IF
    CCState.TextColumn = 0
END SUB


SUB CCClearPage
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            CCCellKind(Column, Row) = CC_CELL_TEXT
            CCTextCode(Column, Row) = 32
            CCTextForeground(Column, Row) = CCState.Foreground
            CCTextBackground(Column, Row) = CCState.Background
            CCTextBlink(Column, Row) = 0
            CCTextLarge(Column, Row) = 0
        NEXT Column
    NEXT Row

    FOR Y = 0 TO CC_GFX_ROWS - 1
        FOR X = 0 TO CC_GFX_COLS - 1
            CCGraphicsColour(X, Y) = -1
        NEXT X
    NEXT Y

    CCState.TextColumn = 0
    CCState.TextRow = 0
END SUB


SUB CCClearTextCell (Column AS INTEGER, Row AS INTEGER)
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM FirstGraphicsY AS INTEGER

    IF Column < 0 OR Column >= CC_TEXT_COLS THEN EXIT SUB
    IF Row < 0 OR Row >= CC_TEXT_ROWS THEN EXIT SUB

    FirstGraphicsY = CC_GFX_ROWS - 1 - Row * 4
    FOR Y = FirstGraphicsY - 3 TO FirstGraphicsY
        FOR X = Column * 2 TO Column * 2 + 1
            IF X >= 0 AND X < CC_GFX_COLS AND Y >= 0 AND Y < CC_GFX_ROWS THEN
                CCGraphicsColour(X, Y) = -1
            END IF
        NEXT X
    NEXT Y
END SUB


SUB CCSetGraphicsBlock (X AS INTEGER, Y AS INTEGER)
    DIM Column AS INTEGER
    DIM Row AS INTEGER

    X = CCWrapX%(X)
    Y = CCWrapY%(Y)

    Column = X \ 2
    Row = CC_TEXT_ROWS - 1 - (Y \ 4)

    IF CCState.Flag THEN
        IF CCGraphicsColour(X, Y) >= 0 THEN
            CCGraphicsColour(X, Y) = -1
        ELSE
            CCGraphicsColour(X, Y) = CCState.Foreground
        END IF
    ELSE
        CCGraphicsColour(X, Y) = CCState.Foreground
    END IF

    IF Column >= 0 AND Column < CC_TEXT_COLS AND Row >= 0 AND Row < CC_TEXT_ROWS THEN
        CCCellKind(Column, Row) = CC_CELL_GRAPHICS
        CCTextCode(Column, Row) = 32
        CCTextBackground(Column, Row) = CCState.Background
    END IF
END SUB


SUB CCDrawHorizontalBar (X0 AS INTEGER, X1 AS INTEGER, Y AS INTEGER)
    DIM X AS INTEGER
    DIM StepValue AS INTEGER

    IF X1 >= X0 THEN StepValue = 1 ELSE StepValue = -1
    X = X0
    DO
        CCSetGraphicsBlock X, Y
        IF X = X1 THEN EXIT DO
        X = X + StepValue
    LOOP
END SUB


SUB CCDrawVerticalBar (X AS INTEGER, Y0 AS INTEGER, Y1 AS INTEGER)
    DIM Y AS INTEGER
    DIM StepValue AS INTEGER

    IF Y1 >= Y0 THEN StepValue = 1 ELSE StepValue = -1
    Y = Y0
    DO
        CCSetGraphicsBlock X, Y
        IF Y = Y1 THEN EXIT DO
        Y = Y + StepValue
    LOOP
END SUB


SUB CCDrawVector (X1 AS INTEGER, Y1 AS INTEGER, X0 AS INTEGER, Y0 AS INTEGER)
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM DeltaX AS INTEGER
    DIM DeltaY AS INTEGER
    DIM StepX AS INTEGER
    DIM StepY AS INTEGER
    DIM ErrorValue AS INTEGER
    DIM TwiceError AS INTEGER

    ' Integer best-fit raster line. The tie behaviour is deliberately isolated
    ' here because it is the part to compare with CCEMU vector diagnostics.
    X = X1
    Y = Y1
    DeltaX = ABS(X0 - X1)
    DeltaY = -ABS(Y0 - Y1)
    IF X1 < X0 THEN StepX = 1 ELSE StepX = -1
    IF Y1 < Y0 THEN StepY = 1 ELSE StepY = -1
    ErrorValue = DeltaX + DeltaY

    DO
        CCSetGraphicsBlock X, Y
        IF X = X0 AND Y = Y0 THEN EXIT DO

        TwiceError = 2 * ErrorValue
        IF TwiceError >= DeltaY THEN
            ErrorValue = ErrorValue + DeltaY
            X = X + StepX
        END IF
        IF TwiceError <= DeltaX THEN
            ErrorValue = ErrorValue + DeltaX
            Y = Y + StepY
        END IF
    LOOP
END SUB


SUB CCRender
    DIM Column AS INTEGER
    DIM Row AS INTEGER
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM ScreenX AS INTEGER
    DIM ScreenY AS INTEGER
    DIM BackgroundIndex AS INTEGER

    _DEST CCWindow
    CLS , _RGB32(24, 24, 24)

    ' Character-cell backgrounds.
    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            BackgroundIndex = CCTextBackground(Column, Row)
            ScreenX = Column * 2 * CC_BLOCK_W
            ScreenY = Row * 4 * CC_BLOCK_H
            LINE (ScreenX, ScreenY)-(ScreenX + 2 * CC_BLOCK_W - 1, ScreenY + 4 * CC_BLOCK_H - 1), CCPalette(BackgroundIndex), BF
        NEXT Column
    NEXT Row

    ' Plot blocks use a lower-left origin; the QB64 surface uses upper-left.
    FOR Y = 0 TO CC_GFX_ROWS - 1
        FOR X = 0 TO CC_GFX_COLS - 1
            IF CCGraphicsColour(X, Y) >= 0 THEN
                ScreenX = X * CC_BLOCK_W
                ScreenY = (CC_GFX_ROWS - 1 - Y) * CC_BLOCK_H
                LINE (ScreenX, ScreenY)-(ScreenX + CC_BLOCK_W - 1, ScreenY + CC_BLOCK_H - 1), CCPalette(CCGraphicsColour(X, Y)), BF
            END IF
        NEXT X
    NEXT Y

    FOR Row = 0 TO CC_TEXT_ROWS - 1
        FOR Column = 0 TO CC_TEXT_COLS - 1
            IF CCCellKind(Column, Row) = CC_CELL_TEXT AND CCTextCode(Column, Row) <> 32 THEN
                CCRenderCharacter Column, Row
            END IF
        NEXT Column
    NEXT Row

    CCRenderPanel
END SUB


SUB CCRenderCharacter (Column AS INTEGER, Row AS INTEGER)
    DIM ScreenX AS INTEGER
    DIM ScreenY AS INTEGER
    DIM Glyph AS LONG
    DIM OldDestination AS LONG
    DIM ShowCharacter AS INTEGER

    ShowCharacter = -1
    IF CCTextBlink(Column, Row) THEN
        IF (INT(TIMER(.001) * 2) MOD 2) = 0 THEN
            ShowCharacter = -1
        ELSE
            ShowCharacter = 0
        END IF
    END IF
    IF NOT ShowCharacter THEN EXIT SUB

    ScreenX = Column * 2 * CC_BLOCK_W
    ScreenY = Row * 4 * CC_BLOCK_H

    COLOR CCPalette(CCTextForeground(Column, Row)), CCPalette(CCTextBackground(Column, Row))

    IF CCTextLarge(Column, Row) THEN
        OldDestination = _DEST
        Glyph = _NEWIMAGE(8, 8, 32)
        _DEST Glyph
        LINE (0, 0)-(7, 7), CCPalette(CCTextBackground(Column, Row)), BF
        COLOR CCPalette(CCTextForeground(Column, Row)), CCPalette(CCTextBackground(Column, Row))
        _FONT CCFontNormal
        _PRINTSTRING (0, 0), CHR$(CCTextCode(Column, Row))
        _DEST OldDestination
        _PUTIMAGE (ScreenX, ScreenY)-(ScreenX + 7, ScreenY + 15), Glyph
        _FREEIMAGE Glyph
    ELSE
        _FONT CCFontNormal
        _PRINTSTRING (ScreenX, ScreenY), CHR$(CCTextCode(Column, Row))
    END IF
END SUB


SUB CCRenderPanel
    DIM PanelX AS INTEGER
    DIM PanelY AS INTEGER
    DIM StateText AS STRING

    PanelX = CC_DISPLAY_W + 16
    PanelY = 14

    COLOR _RGB32(240, 240, 240), _RGB32(24, 24, 24)
    _FONT 8
    _PRINTSTRING (PanelX, PanelY), "DIVER QB64 STAGE 3 V02"
    PanelY = PanelY + 20
    _PRINTSTRING (PanelX, PanelY), CCScenario

    PanelY = PanelY + 28
    _PRINTSTRING (PanelX, PanelY), "Type answers on the DIVER screen"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "R restart after start-up completes"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "ESC close"

    PanelY = PanelY + 14
    IF CCFontNormal = 8 THEN
        _PRINTSTRING (PanelX, PanelY), "Font: QB64 fallback (Bedstead not found)"
    ELSE
        _PRINTSTRING (PanelX, PanelY), "Font: Bedstead regular"
    END IF

    PanelY = PanelY + 28
    _PRINTSTRING (PanelX, PanelY), "SOURCE [1010-1445]"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "WD:" + STR$(BASIC_WD) + "  mode: " + BASIC_TimeMode
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "TK:" + STR$(BASIC_TK) + "  IK:" + STR$(BASIC_IK)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "XS:" + STR$(BASIC_XS) + "  YS:" + STR$(BASIC_YS)

    PanelY = PanelY + 28
    IF CCState.Mode = CC_PLOT_MODE THEN
        StateText = "Mode: PLOT  submode:" + STR$(CCState.PlotSubmode)
    ELSE
        StateText = "Mode: TEXT"
    END IF
    _PRINTSTRING (PanelX, PanelY), StateText
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "FG/BG:" + STR$(CCState.Foreground) + "/" + STR$(CCState.Background)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Large:" + STR$(CCState.LargeCharacters <> 0) + "  Flag:" + STR$(CCState.Flag <> 0)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Suppressed text bytes:" + STR$(CCState.SuppressedTextBytes)
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "Graphics blocks:" + STR$(CCCountGraphicsBlocks&)

    PanelY = PanelY + 28
    COLOR _RGB32(90, 240, 130), _RGB32(24, 24, 24)
    _PRINTSTRING (PanelX, PanelY), "Initial gauges; no scheduler"
    PanelY = PanelY + 14
    _PRINTSTRING (PanelX, PanelY), "No QB64 drawing in DIVER layer"
END SUB


SUB CCAddResult (Description AS STRING, Passed AS INTEGER)
    IF CCResultCount >= UBOUND(CCResultText) THEN EXIT SUB
    CCResultCount = CCResultCount + 1
    CCResultText(CCResultCount) = Description
    CCResultPassed(CCResultCount) = Passed
END SUB


SUB CCRunTests
    DIM CountValue AS LONG

    CCResultCount = 0

    ' P01: [1010] complete ordered control chain.
    CCReset
    CCSend1010
    CCAddResult "[1010] page erased blue", CCTextBackground(0, 0) = 4
    CCAddResult "[1010] later BG is cyan", CCState.Background = 6
    CCAddResult "[1010] LARGE is active", CCState.LargeCharacters <> 0

    ' P04: [1261]-[1266] title does not become ordinary text in Plot Mode.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 14, 15
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "title hidden in Plot Mode", CCTextAt%(29, 43, ASC("D")) = 0
    CCAddResult "hidden bytes recorded", CCState.SuppressedTextBytes = 23

    ' P05: diagnostic PLOT 255 restores ordinary text output.
    CCPlotBegin
    CCSend 255
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
    CCAddResult "PLOT 255 reveals title", CCTextAt%(29, 43, ASC("D"))

    ' P06: [1273]-[1277] bar state survives separate PLOT statements.
    CCReset
    CCPlotBegin
    CCSendPlot3 2, 250, 0
    CCPlotBegin
    CCSendPlot2 140, 1
    CCPlotBegin
    CCSend 255
    CCAddResult "X-bar spans x=0..1", CCGraphicsColour(0, 140) >= 0 AND CCGraphicsColour(1, 140) >= 0

    ' P08: [6320] point followed by Vector Mode.
    CCReset
    CCApplyCCI 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CountValue = CCCountGraphicsBlocks&
    CCAddResult "vector includes both ends", CCGraphicsColour(10, 140) >= 0 AND CCGraphicsColour(13, 60) >= 0
    CCAddResult "vector best-fit block count", CountValue = 81

    ' Code 14 consumes two text rows; Code 15 restores normal height.
    CCReset
    CCPlotBegin
    CCSend 14
    CCPlotBegin
    CCSendPlot3 3, 10, 5
    CCWriteText "A"
    CCAddResult "LARGE occupies next row", CCCellKind(10, 6) = CC_CELL_LARGE_CONTINUATION
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 12, 5
    CCWriteText "B"
    CCAddResult "Code 15 restores one row", CCCellKind(12, 6) <> CC_CELL_LARGE_CONTINUATION
END SUB


SUB CCBuildEngineDemonstration
    CCReset
    CCScenario = "Protocol state and mixed output"

    CCSend1010

    ' The page was erased while the background was blue. Cyan becomes the
    ' background for subsequent text, matching the ordered [1010] effects.
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 2, 2
    CCWriteText "NORMAL"

    CCPlotBegin
    CCSend 14
    CCPlotBegin
    CCSendPlot3 3, 2, 5
    CCWriteText "LARGE"

    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSendPlot3 3, 2, 9
    CCWriteText "80 x 48 TEXT / 160 x 192 PLOT"

    ' Black on blue profile-like vector and bar examples.
    CCPlotBegin
    CCSendPlot2 6, 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CCPlotBegin
    CCSend 255

    CCPlotBegin
    CCSendPlot3 2, 250, 20
    CCPlotBegin
    CCSendPlot2 50, 70
    CCPlotBegin
    CCSendPlot2 55, 90
    CCPlotBegin
    CCSend 255
END SUB


SUB CCBuildHiddenTitleDemonstration
    CCReset
    CCScenario = "[1265]-[1266]: title suppressed"

    CCApplyCCI 38
    CCClearPage

    ' [1261] enters Graphic Plot Mode and plots the initial point.
    CCPlotBegin
    CCSendPlot3 2, 14, 15

    ' [1265] positions the text cursor but never leaves Plot Mode.
    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."

    ' No synthetic escape is issued here. The panel records the suppressed
    ' byte count while the terminal correctly remains in Graphic Plot Mode.
END SUB


SUB CCBuildVisibleTitleDemonstration
    CCReset
    CCScenario = "Diagnostic PLOT 255 before title"

    CCApplyCCI 38
    CCClearPage

    CCPlotBegin
    CCSendPlot3 2, 14, 15

    ' Diagnostic only. DIVER.BAS does not contain this escape here.
    CCPlotBegin
    CCSend 255

    CCPlotBegin
    CCSendPlot3 3, 29, 43
    CCWriteText "DIVER SIMULATION MODEL."
END SUB


SUB CCBuildPlotDemonstration
    DIM I AS INTEGER

    CCReset
    CCScenario = "DIVER point, vector and bar submodes"

    CCApplyCCI 38
    CCClearPage

    ' [6320]-form vector.
    CCApplyCCI 32
    CCPlotBegin
    CCSendPlot7 2, 253, 10, 140, 242, 13, 60
    CCPlotBegin
    CCSend 255

    ' [1273]-form horizontal depth ticks with persistent X0.
    CCApplyCCI 38
    CCPlotBegin
    CCSendPlot3 2, 250, 0
    FOR I = 140 TO 40 STEP -10
        CCPlotBegin
        CCSendPlot2 I, 1
    NEXT I
    CCPlotBegin
    CCSend 255

    ' [1346]-form vertical time ticks with persistent Y0.
    CCPlotBegin
    CCSendPlot3 2, 246, 34
    FOR I = 1 TO 141 STEP 20
        CCPlotBegin
        CCSendPlot2 I + 10, 35
    NEXT I
    CCPlotBegin
    CCSend 255
END SUB


SUB CCSend1010
    ' [1010] PLOT 6,39,12,30,22,14
    CCPlotBegin
    CCSendPlot6 6, 39, 12, 30, 22, 14
END SUB


SUB CCSendPlot2 (A AS INTEGER, B AS INTEGER)
    CCSend A
    CCSend B
END SUB


SUB CCSendPlot3 (A AS INTEGER, B AS INTEGER, C AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
END SUB


SUB CCSendPlot4 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
END SUB


SUB CCSendPlot6 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
END SUB


SUB CCSendPlot7 (A AS INTEGER, B AS INTEGER, C AS INTEGER, D AS INTEGER, E AS INTEGER, F AS INTEGER, G AS INTEGER)
    CCSend A
    CCSend B
    CCSend C
    CCSend D
    CCSend E
    CCSend F
    CCSend G
END SUB


FUNCTION CCCountGraphicsBlocks&
    DIM X AS INTEGER
    DIM Y AS INTEGER
    DIM CountValue AS LONG

    FOR Y = 0 TO CC_GFX_ROWS - 1
        FOR X = 0 TO CC_GFX_COLS - 1
            IF CCGraphicsColour(X, Y) >= 0 THEN CountValue = CountValue + 1
        NEXT X
    NEXT Y
    CCCountGraphicsBlocks& = CountValue
END FUNCTION


FUNCTION CCTextAt% (Column AS INTEGER, Row AS INTEGER, CharacterCode AS INTEGER)
    CCTextAt% = 0
    IF Column < 0 OR Column >= CC_TEXT_COLS THEN EXIT FUNCTION
    IF Row < 0 OR Row >= CC_TEXT_ROWS THEN EXIT FUNCTION
    IF CCCellKind(Column, Row) <> CC_CELL_TEXT THEN EXIT FUNCTION
    IF CCTextCode(Column, Row) = CharacterCode THEN CCTextAt% = -1
END FUNCTION


SUB DIVERInteractiveStartup
    DIM BASIC_I AS SINGLE
    DIM BASIC_J AS INTEGER
    DIM BASIC_Y1 AS INTEGER
    DIM BASIC_YO AS INTEGER
    DIM InputValue AS STRING

    CCReset

    BASIC_WD = 0
    BASIC_TimeMode = ""
    CCScenario = "Waiting for WORKING DEPTH"

    ' Original: 1010 PLOT 6,39,12,30,22,14
    ' Translation: preserve all six bytes and their original order.
    CCPlotBegin
    CCSend 6
    CCSend 39
    CCSend 12
    CCSend 30
    CCSend 22
    CCSend 14

    ' Original: 1040 FOR I=0 TO 5 ... 1100 NEXT I:PLOT 30,16
    FOR BASIC_I = 0 TO 5
        ' [1050-1070] PRINT 79 spaces
        FOR BASIC_J = 0 TO 78
            CCWriteText " "
        NEXT BASIC_J

        ' [1080-1085] Y1=191-8*I:YO=Y1-7
        BASIC_Y1 = 191 - 8 * BASIC_I
        BASIC_YO = BASIC_Y1 - 7

        ' [1090] PLOT 2,246,YO,158,Y1,246,YO,159,Y1,255
        CCPlotBegin
        CCSend 2
        CCSend 246
        CCSend BASIC_YO
        CCSend 158
        CCSend BASIC_Y1
        CCSend 246
        CCSend BASIC_YO
        CCSend 159
        CCSend BASIC_Y1
        CCSend 255

        ' [1095] PRINT
        CCNewLine
    NEXT BASIC_I

    ' [1100] PLOT 30,16
    CCPlotBegin
    CCSend 30
    CCSend 16

    ' [1210-1260] Clear five rows of the Dive Monitor area.
    FOR BASIC_I = 1 TO 5
        ' [1230] PLOT 3,66,I*2
        CCPlotBegin
        CCSend 3
        CCSend 66
        CCSend BASIC_I * 2

        ' [1240-1255] PRINT thirteen spaces
        FOR BASIC_J = 66 TO 78
            CCWriteText " "
        NEXT BASIC_J
    NEXT BASIC_I

    ' [1261] PLOT 6,38,8,2,14,15
    CCPlotBegin
    CCSend 6
    CCSend 38
    CCSend 8
    CCSend 2
    CCSend 14
    CCSend 15

    ' [1262] PLOT 27,10,27,10
    CCPlotBegin
    CCSend 27
    CCSend 10
    CCSend 27
    CCSend 10

    ' [1263] PRINT "5 METRE UNITS";
    DIVERWriteVerticalLegend

    ' [1264] PLOT 27,11,27,11
    CCPlotBegin
    CCSend 27
    CCSend 11
    CCSend 27
    CCSend 11

    ' [1265] PRINT:PLOT 3,29,43:PRINT "DIVER SIMULATION MODEL."
    CCNewLine
    CCPlotBegin
    CCSend 3
    CCSend 29
    CCSend 43
    CCWriteText "DIVER SIMULATION MODEL."

    ' [1266] PLOT 3,29,44:PRINT "-----------------------"
    CCPlotBegin
    CCSend 3
    CCSend 29
    CCSend 44
    CCWriteText "-----------------------"

    ' [1273] PLOT 2,250,0
    CCPlotBegin
    CCSend 2
    CCSend 250
    CCSend 0

    ' [1274-1276] FOR I=140 TO 40 STEP -10:PLOT I,1:NEXT I
    FOR BASIC_I = 140 TO 40 STEP -10
        CCPlotBegin
        CCSend BASIC_I
        CCSend 1
    NEXT BASIC_I

    ' [1277] PLOT 255
    CCPlotBegin
    CCSend 255

    ' [1278-1281] Ring the warning bell, then repeat GOSUB 5000 until
    ' the entered working depth is greater than zero and less than 50.
    DO
        BEEP
        CCPlotBegin
        CCSend 6
        CCSend 48
        InputValue = DIVERReadInput$("WORKING DEPTH ")
        BASIC_WD = VAL(InputValue)
        DIVERClearInputLine 14
        IF BASIC_WD <= 0 OR BASIC_WD >= 50 THEN CCScenario = "WORKING DEPTH must be 1-49"
    LOOP WHILE BASIC_WD <= 0 OR BASIC_WD >= 50

    ' [1300-1301] Initial simulation values.
    BASIC_DR = 30
    BASIC_AR = 15
    BASIC_AD = 0
    BASIC_CL = 0

    ' [1303-1309] INPUT time mode. Only the literal REAL selects TK=1/32;
    ' every other answer follows the source ACCELERATED path with TK=.25.
    CCScenario = "Waiting for TIME MODE"
    BEEP
    BASIC_TimeMode = UCASE$(DIVERReadInput$("TIME MODE (REAL OR ACCELERATED)? "))
    DIVERClearInputLine 50
    IF BASIC_TimeMode = "REAL" THEN
        BASIC_TK = 1 / 32
    ELSE
        BASIC_TK = .25
    END IF

    ' [1316-1317] IK=TK:IF IK<0.5 THEN IK=0.5
    BASIC_IK = BASIC_TK
    IF BASIC_IK < .5 THEN BASIC_IK = .5

    ' [1320-1345] Select the source time and depth scales.
    BASIC_XS = 1
    IF BASIC_WD < 17 THEN BASIC_XS = .5
    IF BASIC_WD > 20 THEN BASIC_XS = 2
    BASIC_YS = 2

    ' [1346] PLOT 6,38,2,246,34
    CCPlotBegin
    CCSend 6
    CCSend 38
    CCSend 2
    CCSend 246
    CCSend 34

    ' [1348] FOR I=1 TO 150 STEP XS*10:PLOT I+10,35:NEXT I:PLOT 255
    FOR BASIC_I = 1 TO 150 STEP BASIC_XS * 10
        CCPlotBegin
        CCSend BASIC_I + 10
        CCSend 35
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [1360-1361] PLOT 3,27,40:PRINT "TIME AT 10 MINUTE INTERVALS";
    CCPlotBegin
    CCSend 3
    CCSend 27
    CCSend 40
    CCWriteText "TIME AT 10 MINUTE INTERVALS"

    ' [1362-1368] CO=1:FL=0 and six GOSUB 7000 calls spell NOSTOP.
    DIVERDisplayMonitorCell 1, ASC("N"), 1, 0
    DIVERDisplayMonitorCell 2, ASC("O"), 1, 0
    DIVERDisplayMonitorCell 3, ASC("S"), 1, 0
    DIVERDisplayMonitorCell 4, ASC("T"), 1, 0
    DIVERDisplayMonitorCell 5, ASC("O"), 1, 0
    DIVERDisplayMonitorCell 6, ASC("P"), 1, 0

    ' [1349-1355] Remaining display state used by the initial gauge calls.
    BASIC_AY = -1
    BASIC_LA = 0

    ' [1445] GOSUB 6600:GOSUB 6700
    DIVERGosub6600
    DIVERGosub6700

    CCScenario = "Start-up complete; stopped before [1465]"
END SUB


FUNCTION DIVERReadInput$ (PromptText AS STRING)
    DIM Buffer AS STRING
    DIM Character AS STRING
    DIM KeyValue AS LONG
    DIM CursorColumn AS INTEGER
    DIM FinishedInput AS INTEGER

    ' [5005,5020,5030] Position at Home, print M$ without a newline, and
    ' collect the keyboard response. The visible characters are written into
    ' the synthesised terminal rather than by QB64's native PRINT statement.
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
    CCWriteText PromptText

    DO
        CCRender
        _DISPLAY

        KeyValue = _KEYHIT
        SELECT CASE KeyValue
            CASE 13
                FinishedInput = -1

            CASE 8
                IF LEN(Buffer) > 0 THEN
                    Buffer = LEFT$(Buffer, LEN(Buffer) - 1)
                    CursorColumn = LEN(PromptText) + LEN(Buffer)
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                    CCWriteText " "
                    CCPlotBegin
                    CCSend 3
                    CCSend CursorColumn
                    CCSend 0
                END IF

            CASE 27
                SYSTEM

            CASE 32 TO 126
                IF LEN(Buffer) < 40 THEN
                    Character = UCASE$(CHR$(KeyValue))
                    Buffer = Buffer + Character
                    CCWriteText Character
                END IF
        END SELECT

        _LIMIT 30
    LOOP UNTIL FinishedInput

    DIVERReadInput$ = Buffer
END FUNCTION


SUB DIVERClearInputLine (CharacterCount AS INTEGER)
    ' [5040-5051] and [1305-1306] clear the completed prompt line and Home it.
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
    CCWriteText STRING$(CharacterCount, 32)
    CCPlotBegin
    CCSend 3
    CCSend 0
    CCSend 0
END SUB


SUB DIVERGosub6600
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER
    DIM BASIC_FL AS INTEGER

    ' [6600-6699] Initial depth gauge. AD=0 and AY=-1 make the first call run.
    CCPlotBegin
    CCSend 29
    IF BASIC_AD = BASIC_AY THEN EXIT SUB

    BASIC_ID = 19
    BASIC_FL = 0
    BASIC_VA = INT(BASIC_AD / 10) + 48
    IF BASIC_VA = 48 THEN BASIC_VA = 32
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 20
    BASIC_VA = BASIC_AD - INT(BASIC_AD / 10) * 10 + 48
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL

    BASIC_ID = 21
    BASIC_VA = (BASIC_AD - INT(BASIC_AD)) * 10
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, BASIC_FL
    BASIC_AY = BASIC_AD
END SUB


SUB DIVERGosub6700
    DIM BASIC_ID AS INTEGER
    DIM BASIC_VA AS INTEGER

    ' [6700-6745] Initial air-left gauge. This remains the source's explicitly
    ' described dummy display rate; it is not a physiological calculation.
    BASIC_ID = 22
    BASIC_VA = 13 - INT(BASIC_CL * BASIC_XS / 10)
    IF BASIC_VA < 0 THEN EXIT SUB
    IF BASIC_LA = BASIC_VA THEN EXIT SUB
    BASIC_LA = BASIC_VA
    DIVERDisplayMonitorCell BASIC_ID, BASIC_VA, 1, 0
END SUB


SUB DIVERDisplayDepthTrend (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
    DIM BASIC_I AS INTEGER

    ' [7200-7204] Clear all ten depth-trend bars in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 152
    FOR BASIC_I = 1 TO 10
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7205] VA=0 on the initial call, so no red bars are repainted.
    IF BASIC_VA = 0 THEN EXIT SUB

    ' [7210-7240] Repaint INT(VA) bars in red, or blinking red when FL=64.
    CCPlotBegin
    CCSend 6
    CCSend 1 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 152
    FOR BASIC_I = 1 TO BASIC_VA
        CCPlotBegin
        CCSend 166 - 2 * BASIC_I
        CCSend 155
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255
END SUB


SUB DIVERDisplayAirGauge (BASIC_VA AS INTEGER, BASIC_FL AS INTEGER)
    DIM BASIC_I AS INTEGER

    ' [7301-7304] Clear all eighteen air-gauge positions in black.
    CCPlotBegin
    CCSend 6
    CCSend 0
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 1 TO 18
        CCPlotBegin
        CCSend 183 - 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7305-7308] Repaint the lower three positions in magenta.
    CCPlotBegin
    CCSend 6
    CCSend 5
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 16 TO 18
        CCPlotBegin
        CCSend 185 - 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255

    ' [7310-7342] Repaint INT(VA) positions in green.
    IF INT(BASIC_VA) = 0 THEN EXIT SUB
    CCPlotBegin
    CCSend 6
    CCSend 2 + BASIC_FL
    CCSend 2
    CCSend 250
    CCSend 133
    FOR BASIC_I = 1 TO BASIC_VA
        CCPlotBegin
        CCSend 153 + 2 * BASIC_I
        CCSend 134
    NEXT BASIC_I
    CCPlotBegin
    CCSend 255
END SUB


SUB DIVERWriteVerticalLegend
    DIM SavedMode AS INTEGER
    DIM SavedColumn AS INTEGER
    DIM SavedRow AS INTEGER
    DIM SavedDirection AS INTEGER
    DIM SavedLarge AS INTEGER

    ' [1261-1263] The source enters X Point Plot at (14,15), selects vertical
    ' visible-cursor writing with two ESC-J sequences, then PRINTs the legend.
    ' The photographs and the completed browser reconstruction establish the
    ' visible result, while the precise 8001 plot-to-text cursor hand-off is
    ' not documented sufficiently to generalise it as a terminal rule.
    '
    ' This adapter therefore writes the verified vertical text through
    ' the terminal character-cell renderer at column 3 and the corresponding
    ' established start row. It also consumes the setup point so it is not
    ' exposed as an isolated four-pixel mark beneath the time axis.
    SavedMode = CCState.Mode
    SavedColumn = CCState.TextColumn
    SavedRow = CCState.TextRow
    SavedDirection = CCState.WriteDirection
    SavedLarge = CCState.LargeCharacters

    CCGraphicsColour(14, 15) = -1
    CCState.Mode = CC_TEXT_MODE
    CCState.TextColumn = 3
    CCState.TextRow = 15
    CCState.WriteDirection = CC_WRITE_VERTICAL
    CCState.LargeCharacters = 0
    CCWriteText "5 METRE UNITS"

    CCState.Mode = SavedMode
    CCState.TextColumn = SavedColumn
    CCState.TextRow = SavedRow
    CCState.WriteDirection = SavedDirection
    CCState.LargeCharacters = SavedLarge
END SUB


SUB DIVERDisplayMonitorCell (BASIC_ID AS INTEGER, BASIC_VA AS INTEGER, BASIC_CO AS INTEGER, BASIC_FL AS INTEGER)
    DIM GaugeHandled AS INTEGER

    ' Stage 3 translation of the GOSUB 7000 paths required by IDs 1-22.

    ' [7100] IF FL=1 THEN FL=64
    IF BASIC_FL = 1 THEN BASIC_FL = 64

    ' [7110] PLOT 14
    CCPlotBegin
    CCSend 14

    ' [7120,7300-7342] ID=22 is the air-left bar gauge.
    IF BASIC_ID = 22 THEN
        DIVERDisplayAirGauge BASIC_VA, BASIC_FL
        GaugeHandled = -1
    END IF

    ' [7130,7200-7240] ID=21 is the fractional-depth trend gauge.
    IF BASIC_ID = 21 AND NOT GaugeHandled THEN
        DIVERDisplayDepthTrend BASIC_VA, BASIC_FL
        GaugeHandled = -1
    END IF

    IF GaugeHandled THEN
        ' [7440-7451] Common gauge cleanup and return.
        CCPlotBegin
        CCSend 15
        CCPlotBegin
        CCSend 3
        CCSend 80
        CCSend 0
        EXIT SUB
    END IF

    IF BASIC_ID >= 19 THEN
        ' [7131,7250] Depth digits use CCI 1 and columns 57+ID on row 4.
        CCPlotBegin
        CCSend 6
        CCSend 1 + BASIC_FL
        CCSend 3
        CCSend 57 + BASIC_ID
        CCSend 4
    ELSE
        ' [7145] IDs 1-6 use columns 68+ID on row 4.
        CCPlotBegin
        CCSend 3
        CCSend 68 + BASIC_ID
        CCSend 4

        ' [7147-7149] CO selects green or magenta.
        CCPlotBegin
        CCSend 6
        IF BASIC_CO = 1 THEN
            CCSend 2 + BASIC_FL
        ELSE
            CCSend 5 + BASIC_FL
        END IF
    END IF

    ' [7170-7180] Clamp to a printable character and PLOT VA.
    IF BASIC_VA > 95 THEN BASIC_VA = 63
    IF BASIC_VA < 32 THEN BASIC_VA = 63
    CCPlotBegin
    CCSend BASIC_VA

    ' [7440-7451] Restore normal characters and move the cursor off-screen.
    CCPlotBegin
    CCSend 15
    CCPlotBegin
    CCSend 3
    CCSend 80
    CCSend 0
END SUB
